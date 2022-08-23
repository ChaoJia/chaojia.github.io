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
## Visibility Buffer Rendering

Visibility buffer rendering [^paper-2013] [^filmic-world-blog] [^nanite-siggraph-2021] has gained its popularity as triangle meshes used in real-time applications are getting much finer details, thanks to rapidly increasing memory capacity and computational power of the GPU. 

to be continued...

[^basic-renderer-source-code]: [Source code on gitlab](https://gitlab.com/chao-jia/spock#the-basic-renderer)
[^paper-2013]: Christopher A. Burns and Warren A. Hunt, _[The Visibility Buffer: A Cache-Friendly Approach to Deferred Shading](https://jcgt.org/published/0002/02/04/)_, Journal of Computer Graphics Techniques (JCGT), vol. 2, no. 2, 55-69, 2013
[^filmic-world-blog]: [Visibility Buffer Rendering with Material Graphs](http://filmicworlds.com/blog/visibility-buffer-rendering-with-material-graphs/)
[^scaling-ddgi]: Zander Majercik, Adam Marrs, Josef Spjut, and Morgan McGuire, [Scaling Probe-Based Real-Time Dynamic Global Illumination for Production](https://jcgt.org/published/0010/02/01/), Journal of Computer Graphics Techniques (JCGT), vol. 10, no. 2, 1-29, 2021
[^ddgi]: Zander Majercik, Jean-Philippe Guertin, Derek Nowrouzezahrai, and Morgan McGuire, [Dynamic Diffuse Global Illumination with Ray-Traced Irradiance Fields](https://jcgt.org/published/0008/02/01/), Journal of Computer Graphics Techniques (JCGT), vol. 8, no. 2, 1-30, 2019
[^svgf]: Schied, Christoph, et al. [Spatiotemporal variance-guided filtering: real-time reconstruction for path-traced global illumination.](https://dl.acm.org/doi/10.1145/3105762.3105770) Proceedings of High Performance Graphics. 2017. 1-12.
[^nanite-siggraph-2021]: [Nanite - A Deep Dive](https://advances.realtimerendering.com/s2021/Karis_Nanite_SIGGRAPH_Advances_2021_final.pdf)