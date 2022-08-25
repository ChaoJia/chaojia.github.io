---
title: 'A Basic Vulkan Renderer'
description: 'an introduction to my basic Vulkan renderer'
date: 2022-08-22
math: true
categories:
  - rendering
  - graphics
tags:
  - real-time rendering 
  - vulkan
  - RTX
  - C++
thumbnail: "/images/posts/2022-08-22/basic-vulkan-renderer-thumbnail.jpg"
---

As part of the effort to get myself familiar with Vulkan, I developed a real-time renderer featuring global illumination with RTX technique [^basic-renderer-source-code]. Aside from Dynamic Diffuse Global Illumination (DDGI) [^scaling-ddgi] [^ddgi], ray-traced soft shadow and specular reflections with spatial temporal-denoising (SVGF [^svgf]), I've also tried out some other interesting ideas.

<!--more-->
## Visibility buffer rendering and scene management

Visibility buffer rendering [^paper-2013] has gained its popularity as triangle meshes used in real-time applications are getting much finer details thanks to the rapidly increasing memory capacity and computational power of the GPU [^nanite-siggraph-2021]. More details for triangle meshes generally means fewer pixels each triangle can cover. Due to low quad utilization [^filmic-world-blog], traditional deferred shading tends to get very inefficient since there is usually a lot of computation going on in the fragment shader to fill the G-buffer. 

Since there doesn't seem to be any solid reasons against it, I decided to go with visibility buffer rendering, i.e., a simple G-buffer consisting of only triangle indices and depth value for each pixel. One problem needs to be addressed is how to recover the geometric data required for shading from a triangle index, including world position, normal, uv coordinates at each pixel. Moreover, We need the derivatives of uv coordinates to determine the LOD of the textures. The derivatives of the world position may be useful for e.g. [constructing cotangent frame](http://www.thetenthplanet.de/archives/1180). To get the computation of partial derivatives right, I did some math and detailed the method for analytically computing partial derivatives in [my last post]({{< ref "/content/posts/21-11-29-vertex-attrib-interp.md" >}}). Another piece of information needed for shading is material data, such as textures and alpha cutoff value (for e.g. tree leaves). To simplify scene management and avoid frequently updating descriptor sets, I took a bindless approach [^zeux-2020-vk-renderer-bindless]. Although many mobile devices and integrated cards are not very friendly to this approach due to lack of support for Vulkan feature `shaderSampledImageArrayNonUniformIndexing` or `VK_EXT_descriptor_indexing`, or the supported limits such as `maxPerStageDescriptorSampledImages` are too small for typical test scenes like Sponza, GPUs that support RTX are usually very generous in this regard.

Partly due to a variety of different 3D formats, scene management can get quite complicated. Although I've dealt with `.ply` and `.obj` files while working on [my master project](https://gitlab.com/chao-jia/pbd), neither of them can really fulfill the requirement of a renderer by today's standard, at least in terms of materials that support Physically-Based Rendering (PBR). Therefore, this renderer only supports [glTF](https://www.khronos.org/gltf/) format as it is royalty-free, extensible and has support for basic PBR materials among other advantages. Many other formats can be easily converted to glTF using [blender](https://www.blender.org/). Despite the fact that glTF can store most of its data in binary form, loading glTF models that contain many textures can still be very slow because decoding common image formats (e.g. `.jpg` or `.png`) is rather computationally expensive, but directly storing the decoded image data in a cache file is not ideal either due to storage constraints. Inspired by [this article](https://momentsingraphics.de/ToyRenderer2SceneManagement.html), I also opted for [block compression](https://docs.microsoft.com/en-us/windows/win32/direct3d10/d3d10-graphics-programming-guide-resources-block-compression) to reduce the cache file size while accelerating scene loading. To facilitate batch upload of textures to the device (GPU), I packed all the textures alongside other scene data into a single binary cache file.

Putting everything together, I came up with the following binary format for the scene cache file:

```cpp
// metadata to determine if the cache is up-to-date
// punctual lights
// aabb lower and upper
vertex_offsets : uint32_t[material_type_count + 1]
index_offsets : uint32_t[material_type_count + 1]
mtl_param_emissive_idx_offsets : uint32_t[material_type_count + 1]
mtl_param_alpha_cutoff_offsets : uint32_t[material_type_count + 1]
emissive_texture_count : uint32_t // at least one black texture
texture_strides : uint32_t[material_type_count]
texture_offsets : uint32_t[material_type_count + 1] // texture index offset for each mtl_type
position_buffer
normal_buffer
uv_buffer
index_buffer
triangle_mtl_idx_buffer
mtl_param_buffer; // array of scene_t::mtl_param_type[]
sampler_count: uint16_t
sampler_infos
texture_descriptor_array
// metadata to verify data integrity
```

The mesh data and material data are sorted by material types. Generally different material types need different rendering pipelines. For example, `MTL_TYPE_PRIMARY` corresponds to the metallic-roughness material with `alphaMode` set to the default value `OPAQUE`, while `MTL_TYPE_ALPHA_CUTOFF` differs only by setting `alphaMode` to `MASK`. An instance of a material type refers to a specific set of textures and material parameters.
`{ vertex | index | mtl_param* | texture }_offsets` are offsets of different material types in `*_buffer` or `texture_descriptor_array`. All `*Factor` fields in the glTF materials are either converted to `1x1` textures or multiplied into the corresponding texture.
Occlusion, metallic and roughness factors are merged into one texture as different color channels. Since emissive textures are relatively uncommon, a `1x1` black image shared by non-emissive material instances is put at the beginning of `texture_descriptor_array`, followed by other emissive textures. `vkCmdBlitImage`, C++ `std::thread` and parallel version of C++ standard algorithms library are used for faster generation of the cache data.

The cache file can greatly reduce the scene loading time. Here is the time it takes to load the scene _Amazon Lumberyard Bistro (exterior)_ (glTF + textures: 898 MB; cache file: 1.05 GB) from a SSD:

 glTF 1st load | glTF 2nd load | cache 1st load | cache 2nd load | cache generation 
 :------------:| :-----------: | :------------: | :------------: | :-----------: 
 35.554 s      | 21.874 s      | 2.239 s        | 1.334 s        | 23.468 s

The operating system (Windows) probably caches those files in RAM after the 1st load, hence the 2nd load is faster than the 1st load. The difference can be much larger for HDD. Indeed, loading the cache from my HDD for the first time can take 10 seconds, but subsequent loading only takes about 2 seconds. 

During the development of scene management, I noticed something interesting about the performance of `std::vector`. To avoid surprising behavior, `std::vector` forces initialization on allocation, with either default zero-initialization or user provided value. Although this is the expected behavior for many use cases, it can unnecessarily hurt performance if the requested amount of memory is huge and the entire purpose of the allocation is to fill it with fixed amount of data but the size is unknown at compile time. In this case, plain array managed by `std::unique_ptr` is a better option:
```cpp
const uint32_t num_f32_texels = 5592405; // texture: 2048 x 2048 x rgb, with full mipmap chain
std::vector<glm::vec3> f32_texels(num_f32_texels, glm::vec3{}); // took 15.401600 ms
std::vector<glm::vec3> f32_texels(num_f32_texels); // took 9.379000 ms
std::unique_ptr<glm::vec3[]> f32_texels(new glm::vec3[num_f32_texels]); // took 0.014100 ms
```

Another caveat I've noticed is the `propertyFlags` of Vulkan memory. One common operation is to copy a chunk of data from host to the device, therefore device memory is often allocated with the flag `HOST_COHERENT`. However, to copy data from the device to host, `HOST_CACHED` needs to be specified instead of `HOST_COHERENT`. It can make a huge difference. On my laptop (RTX 2070 Mobile), it takes _61.931_ ms to copy 21 MB from a ` HOST_VISIBLE`, optionally `HOST_COHERENT` buffer to the host memory, but only _3.839_ ms if the buffer is `HOST_CACHED`.


to be continued...

[^basic-renderer-source-code]: [Source code on gitlab](https://gitlab.com/chao-jia/spock#the-basic-renderer)

[^paper-2013]: Christopher A. Burns and Warren A. Hunt, _[The Visibility Buffer: A Cache-Friendly Approach to Deferred Shading](https://jcgt.org/published/0002/02/04/)_, Journal of Computer Graphics Techniques (JCGT), vol. 2, no. 2, 55-69, 2013

[^filmic-world-blog]: This article [Visibility Buffer Rendering with Material Graphs](http://filmicworlds.com/blog/visibility-buffer-rendering-with-material-graphs/) provided thorough analysis and comprehensive performance test on forward shading, deferred shading and visibility buffer rendering

[^scaling-ddgi]: Zander Majercik, Adam Marrs, Josef Spjut, and Morgan McGuire, [Scaling Probe-Based Real-Time Dynamic Global Illumination for Production](https://jcgt.org/published/0010/02/01/), Journal of Computer Graphics Techniques (JCGT), vol. 10, no. 2, 1-29, 2021

[^ddgi]: Zander Majercik, Jean-Philippe Guertin, Derek Nowrouzezahrai, and Morgan McGuire, [Dynamic Diffuse Global Illumination with Ray-Traced Irradiance Fields](https://jcgt.org/published/0008/02/01/), Journal of Computer Graphics Techniques (JCGT), vol. 8, no. 2, 1-30, 2019

[^svgf]: Schied, Christoph, et al. [Spatiotemporal variance-guided filtering: real-time reconstruction for path-traced global illumination.](https://dl.acm.org/doi/10.1145/3105762.3105770) Proceedings of High Performance Graphics. 2017. 1-12.

[^nanite-siggraph-2021]: [Nanite - A Deep Dive](https://advances.realtimerendering.com/s2021/Karis_Nanite_SIGGRAPH_Advances_2021_final.pdf)

[^zeux-2020-vk-renderer-bindless]: See the section _Bindless descriptor designs_ of [this article](https://zeux.io/2020/02/27/writing-an-efficient-vulkan-renderer/)
