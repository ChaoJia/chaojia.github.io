+++
author = "Chao Jia"
title = "Portfolio"
date = "2022-08-20"
description = "Portfolio"
thumbnail = "images/portfolio-thumbnail.jpg"
+++

## Real-Time C++ Vulkan Renderer with RTX global illumination

{{< youtube Ca6BCejFWLw>}}

My Vulkan renderer featuring Dynamic Diffuse Global Illumination (DDGI) [^scaling-ddgi] [^ddgi], ray-traced soft shadow and specular reflections with spatio-temporal denoising (SVGF [^svgf]). The renderer is implemented with C++, Vulkan and GLSL. 
More infos about the renderer can be found in [this post]({{< ref "posts/22-08-22-vulkan-basic-renderer.md" >}}). 

[[source code](https://gitlab.com/chao-jia/spock)]

## Real-Time Unified Physics Simulation of Variable Sized Particles
{{< youtube MOWeGT9jZxQ >}}

This video showcases my master project done in 2017. This project is based on the position-based unified dynamic framework presented by Macklin et al [^2014-Macklin].
In this project,  we removed the restriction of fixed radius of the particles in the same scene entailed by the aforementioned unified framework to reduce memory footprint of the physics simulation while maintaining the real-time performance (60+ fps on RTX 1060 Mobile). 

I also implemented and optimized algorithms for solid voxelization and construction of signed distance field on the GPU using CUDA to accelerate scene initialization. The scenes are rendered with OpenGL 4.
For efficient collision detection between differently sized particles and generation of density constraints for fluids, I implemented BVH (Bounding Volume Hierarchy) construction and traversal on the GPU. 

[[source code](https://gitlab.com/chao-jia/pbd)] [{{< pdf-download path="/files/master_thesis_chao_jia.pdf" title="master thesis" >}}]

## Heightfield Water Simulation and Rendering
{{< youtube xU9GIU0JsA0 >}}

Heightfield-based real-time water simulation with C++, Qt 5  and OpenGL 4 as a freely chosen topic for the final assignment of a practicum course in 2016 summer semester.  Inspired by WebGL Water (https://madebyevan.com/webgl-water/).

[[source code](https://gitlab.com/chao-jia/height_field_water)]


## Other projects
See [here]({{< ref "about.md#projects" >}}) for more projects I've worked on.

[^scaling-ddgi]: Zander Majercik, Adam Marrs, Josef Spjut, and Morgan McGuire, [Scaling Probe-Based Real-Time Dynamic Global Illumination for Production](https://jcgt.org/published/0010/02/01/), Journal of Computer Graphics Techniques (JCGT), vol. 10, no. 2, 1-29, 2021
[^ddgi]: Zander Majercik, Jean-Philippe Guertin, Derek Nowrouzezahrai, and Morgan McGuire, [Dynamic Diffuse Global Illumination with Ray-Traced Irradiance Fields](https://jcgt.org/published/0008/02/01/), Journal of Computer Graphics Techniques (JCGT), vol. 8, no. 2, 1-30, 2019
[^svgf]: Schied, Christoph, et al. [Spatiotemporal variance-guided filtering: real-time reconstruction for path-traced global illumination.](https://dl.acm.org/doi/10.1145/3105762.3105770) Proceedings of High Performance Graphics. 2017. 1-12.
[^2014-Macklin]: Miles Macklin, Matthias Müller, Nuttapong Chentanez, and Tae-Yong Kim. 2014. [Unified particle physics for real-time applications](https://doi.org/10.1145/2601097.2601152). ACM Trans. Graph. 33, 4, Article 153 (July 2014), 12 pages.