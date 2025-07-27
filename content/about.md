+++
title = "About Me"
description = "About Chao Jia"
date = "2022-05-13"
lastmod = "2022-06-29"
aliases = ["about", "about-chao-jia", "contact"]
author = "Chao Jia"
+++

Hi, my name is Chao JIA ([IPA](https://en.wikipedia.org/wiki/International_Phonetic_Alphabet): `/tʃaʊ. dʒiʌ/`). I worked as a [research assistant](https://www.cg.tuwien.ac.at/staff/ChaoJia) in the [Rendering and Modeling group](https://www.cg.tuwien.ac.at/group/Rendering-and-Modeling) at TU Wien from July 2018 until June 2022 after I got my Master's degree in computer science from [Karlsruhe Institute of Technology](https://www.kit.edu/). I'm interested in __real-time rendering__ (__Vulkan__ and __OpenGL 4__), __high-performance C++__, __physically based simulation__ and __general-purpose computing on GPU__ (__GPGPU__). I'm no stranger to scripting languages such as __CMake__ and __Python__ either. 

## Projects
---

Some of the projects I've worked on can be found in [__my portfolio__]({{< ref "portfolio.md" >}}). Here are some other projects during my work at TU Wien:

* For the paper _View-Dependent Impostors for Architectural Shape Grammars_ [^pg21-impostors], I extended a __C++ template library__ for shape grammar evaluation and implemented level-of-detail mechanism for procedural geometry shape grammars; 
* For the paper _On Provisioning Procedural Geometry Workloads on Edge Architectures_ [^webist21-edge], I implemented and optimized GPU shape-grammar evaluation using CUDA, developed an efficient cross-platform web service for procedural geometry workload with __C++ multithreading__ and __Boost__ library, and used __docker container__ to facilitate fast deployment on different edge devices. [Protocol buffers (Protobuf)](https://developers.google.com/protocol-buffers) was used for client-server communication.
* For the paper _Sabrina: Modeling and Visualization of Economy Data with Incremental Domain Knowledge_ [^ieeevis19-sabrina], in collaboration with other research groups, I quickly picked up __Python__, __JavaScript__, __ReactJS__ alongside other web development techniques, and put together a web application for the visualization of Austria financial data. I've also written some __Python__ scripts for data processing ([source code](https://gitlab.com/chao-jia/ctvis)).

During my free time, I have contributed [multiple new ports and fixes](https://github.com/microsoft/vcpkg/pulls?q=is%3Apr+author%3Achaojia+is%3Aclosed+is%3Amerged+) to [vcpkg](https://github.com/microsoft/vcpkg) as I was trying to get a deeper understanding of CMake and vcpkg. 
I've also developed a __blender addon__ to visualize `.ply` files containing point clouds with some custom attributes using __Python__ ([source code](https://gitlab.com/chao-jia/blender_addon_dev/-/tree/master/ttm_ply)).

## Publications

[^pg21-impostors]: __Chao Jia__, Moritz Roth, Bernhard Kerbl, Michael Wimmer. _[View-Dependent Impostors for Architectural Shape Grammars](https://doi.org/10.2312/pg.20211390)_. In Pacific Graphics Short Papers, Posters, and Work-in-Progress Papers, pages 63-64. October 2021.

[^webist21-edge]: Ilir Murturi, __Chao Jia__, Bernhard Kerbl, Michael Wimmer, Schahram Dustdar, Christos Tsigkanos. _[On Provisioning Procedural Geometry Workloads on Edge Architectures](https://doi.org/10.5220/0010687800003058)_. In Proceedings of the 17th International Conference on Web Information Systems and Technologies - WEBIST, pages 354-359. October 2021.

[^ieeevis19-sabrina]: Alessio Arleo, Christos Tsigkanos, __Chao Jia__, Roger Leite, Ilir Murturi, Manfred Klaffenböck, Schahram Dustdar, Silvia Miksch, Michael Wimmer, Johannes Sorger. _[Sabrina: Modeling and Visualization of Economy Data with Incremental Domain Knowledge](https://doi.org/10.1109/VISUAL.2019.8933598)_. In IEEE VIS 2019. October 2019. 
