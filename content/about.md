+++
title = "About Me"
description = "About Chao Jia"
date = "2022-05-13"
aliases = ["about", "about-chao-jia", "contact"]
author = "Chao Jia"
+++

Hi, my name is Chao JIA ([IPA](https://en.wikipedia.org/wiki/International_Phonetic_Alphabet): `/tʃaʊ. dʒʌ/`). I started my work at TU Wien in 2018 as a [research assistant](https://www.cg.tuwien.ac.at/staff/ChaoJia) in the [Rendering and Modeling group](https://www.cg.tuwien.ac.at/group/Rendering-and-Modeling) after I got my Master's degree in computer science from [Karlsruhe Institute of Technology](https://www.kit.edu/). I'm interested in __real-time rendering__ (__OpenGL 4__ and __Vulkan__), __high-performance C++__, __physically based simulation__ and __general-purpose computing on GPU__ (mainly __CUDA__, a bit __OpenCL__). [__CMake__](https://cmake.org) is no stranger to me either, as I've been using it as the build system for my C++ projects and [__vcpkg__](https://vcpkg.io/en/index.html) as package manager. Although I haven't worked on large python projects, I've been writing __python__ scripts to automate many tasks. 

## Projects
---

Some of the projects I've worked on can be found in [my portfolio]({{< ref "/content/portfolio.md" >}}). Here are some other projects during my work at TU Wien:

* For the paper _View-Dependent Impostors for Architectural Shape Grammars_ [^pg21-impostors], I extended a __C++ template library__ for shape grammar evaluation and implemented level-of-detail mechanism for procedural geometry shape grammars; 
* For the paper _On Provisioning Procedural Geometry Workloads on Edge Architectures_ [^webist21-edge], I implemented an efficient __multi-threaded__ web service for procedural geometry workloads using [__Boost Beast library__](https://github.com/boostorg/beast) in C++. [Protocol buffers (Protobuf)](https://developers.google.com/protocol-buffers) was used for client-server communication. I have put a lot of efforts into making sure the program is __platform-agnostic__ and made a __docker container__ for the application to facilitate fast deployment on different edge devices; I have also implemented a GPU shape grammar evaluation system using __CUDA__ targeting NVidia Jetson devices; 
* For the paper _Sabrina: Modeling and Visualization of Economy Data with Incremental Domain Knowledge_ [^ieeevis19-sabrina], in collaboration with other research groups, I familiarized myself with __Javascript__, __ReactJS__ and __Postgres__, and put together a web application for the visualization of Austria financial data. I've also written some __Python__ scripts for data processing ([source code](https://gitlab.com/chao-jia/ctvis)).

During my free time, I have contributed [a few new ports and fixes](https://github.com/microsoft/vcpkg/pulls?q=is%3Apr+author%3Achaojia+is%3Aclosed+is%3Amerged+) to [vcpkg](https://github.com/microsoft/vcpkg) as I was trying to get a deeper understanding of CMake and vcpkg. 
I've also developed a __blender addon__ to visualize `.ply` files containing point clouds with some custom attributes using __Python__ ([source code](https://gitlab.com/chao-jia/blender_addon_dev/-/tree/master/ttm_ply)).

## Publications

[^pg21-impostors]: __Chao Jia__, Moritz Roth, Bernhard Kerbl, Michael Wimmer. _[View-Dependent Impostors for Architectural Shape Grammars](https://doi.org/10.2312/pg.20211390)_. In Pacific Graphics Short Papers, Posters, and Work-in-Progress Papers, pages 63-64. October 2021.

[^webist21-edge]: Ilir Murturi, __Chao Jia__, Bernhard Kerbl, Michael Wimmer, Schahram Dustdar, Christos Tsigkanos. _[On Provisioning Procedural Geometry Workloads on Edge Architectures](https://doi.org/10.5220/0010687800003058)_. In Proceedings of the 17th International Conference on Web Information Systems and Technologies - WEBIST, pages 354-359. October 2021.

[^ieeevis19-sabrina]: Alessio Arleo, Christos Tsigkanos, __Chao Jia__, Roger Leite, Ilir Murturi, Manfred Klaffenböck, Schahram Dustdar, Silvia Miksch, Michael Wimmer, Johannes Sorger. _[Sabrina: Modeling and Visualization of Economy Data with Incremental Domain Knowledge](https://doi.org/10.1109/VISUAL.2019.8933598)_. In IEEE VIS 2019. October 2019. 
