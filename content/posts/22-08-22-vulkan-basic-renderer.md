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
thumbnail: "/images/posts/2022-08-22/basic-vulkan-renderer-thumbnail.jpg"
---

As part of the effort to get myself familiar with Vulkan, I developed a real-time renderer featuring global illumination with RTX technique [^basic-renderer-source-code]. Aside from Dynamic Diffuse Global Illumination (DDGI) [^scaling-ddgi] [^ddgi], ray-traced soft shadow and specular reflections with spatial temporal-denoising (SVGF [^svgf]), I've also tried out some other interesting ideas.

<!--more-->
## Visibility buffer rendering

Visibility buffer rendering [^paper-2013] has gained its popularity as triangle meshes used in real-time applications are getting much finer details thanks to the rapidly increasing memory capacity and computational power of the GPU [^nanite-siggraph-2021]. More details for triangle meshes generally means fewer pixels each triangle can cover. Therefore, hardware rasterization tend to get very inefficient if there is a lot of computation going on in the fragment shader for the generation of the G-buffer due to low quad utilization [^filmic-world-blog]. 

Since there doesn't seem to be any good reasons against it, I decided to go with visibility buffer rendering, i.e., a simple G-buffer consisting of only triangle indices and depth value for each pixel. One problem needs to be addressed is how to recover the geometric data required for shading from a triangle index, including world position, normal, uv coordinates at each pixel. Moreover, We also need the derivatives of uv coordinates to determine the LOD of the textures. The derivatives of the world position may be useful for e.g. [constructing cotangent frame](http://www.thetenthplanet.de/archives/1180). To get the computation of partial derivatives right, I did some math and detailed the method for analytically computing partial derivatives in [this article]({{< ref "/content/posts/21-11-29-vertex-attrib-interp.md" >}}).

to be continued...

[^basic-renderer-source-code]: [Source code on gitlab](https://gitlab.com/chao-jia/spock#the-basic-renderer)

[^paper-2013]: Christopher A. Burns and Warren A. Hunt, _[The Visibility Buffer: A Cache-Friendly Approach to Deferred Shading](https://jcgt.org/published/0002/02/04/)_, Journal of Computer Graphics Techniques (JCGT), vol. 2, no. 2, 55-69, 2013

[^filmic-world-blog]: This article [Visibility Buffer Rendering with Material Graphs](http://filmicworlds.com/blog/visibility-buffer-rendering-with-material-graphs/) provided thorough analysis and comprehensive performance test on forward shading, deferred shading and visibility buffer rendering

[^scaling-ddgi]: Zander Majercik, Adam Marrs, Josef Spjut, and Morgan McGuire, [Scaling Probe-Based Real-Time Dynamic Global Illumination for Production](https://jcgt.org/published/0010/02/01/), Journal of Computer Graphics Techniques (JCGT), vol. 10, no. 2, 1-29, 2021

[^ddgi]: Zander Majercik, Jean-Philippe Guertin, Derek Nowrouzezahrai, and Morgan McGuire, [Dynamic Diffuse Global Illumination with Ray-Traced Irradiance Fields](https://jcgt.org/published/0008/02/01/), Journal of Computer Graphics Techniques (JCGT), vol. 8, no. 2, 1-30, 2019

[^svgf]: Schied, Christoph, et al. [Spatiotemporal variance-guided filtering: real-time reconstruction for path-traced global illumination.](https://dl.acm.org/doi/10.1145/3105762.3105770) Proceedings of High Performance Graphics. 2017. 1-12.

[^nanite-siggraph-2021]: [Nanite - A Deep Dive](https://advances.realtimerendering.com/s2021/Karis_Nanite_SIGGRAPH_Advances_2021_final.pdf)
