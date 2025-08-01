(function toggleColorModes(){
  const light = 'lit';
  const dark = 'dim';
  const storageKey = 'colorMode';
  const key = '--color-mode';
  const data = 'data-mode';
  const bank = window.localStorage;

  function currentMode() {
    let acceptableChars = light + dark;
    acceptableChars = [...acceptableChars];
    let mode = getComputedStyle(doc).getPropertyValue(key).replace(/\"/g, '').trim();

    mode = [...mode].filter(function(letter){
      return acceptableChars.includes(letter);
    });

    return mode.join('');
  }

  function utterancesTheme(isDarkMode) {
    if (document.querySelector('.utterances-frame')) {
      const theme = isDarkMode ? 'github-dark' : 'github-light'
      const message = {
        type: 'set-theme',
        theme: theme
      };
      const iframe = document.querySelector('.utterances-frame');
      iframe.contentWindow.postMessage(message, 'https://utteranc.es');
    }
  }

  function changeMode(isDarkMode) {
    if(isDarkMode) {
      bank.setItem(storageKey, light)
      elemAttribute(doc, data, light);
    } else {
      bank.setItem(storageKey, dark);
      elemAttribute(doc, data, dark);
    }
  }

  function setUserColorMode(mode = false) {
    const isDarkMode = currentMode() == dark;
    const storedMode = bank.getItem(storageKey);
    if(storedMode) {
      if(mode) {
        changeMode(isDarkMode);
      } else {
        elemAttribute(doc, data, storedMode);
      }
    } else {
      if(mode === true) {
        changeMode(isDarkMode)
      }
    }
    utterancesTheme(!isDarkMode);
  }

  setUserColorMode();

  doc.addEventListener('click', function(event) {
    let target = event.target;
    let modeClass = 'color_choice';
    let animateClass = 'color_animate';
    let isModeToggle = containsClass(target, modeClass);
    if(isModeToggle) {
      pushClass(target, animateClass);
      setUserColorMode(true);
    }
  });
})();

function fileClosure(){

  (function updateDate() {
    const date = new Date();
    const year = date.getFullYear();
    const yearEl = elem('.year');
    yearEl ? yearEl.innerHTML = `${year}` : false;
  })();

  (function makeExternalLinks(){
    let links = elems('a');
    if(links) {
      Array.from(links).forEach(function(link){
        let target, rel, blank, noopener, attr1, attr2, url, isExternal;
        url = elemAttribute(link, 'href');
        isExternal = (url && typeof url == 'string' && url.startsWith('http')) && !url.startsWith(baseURL) ? true : false;
        if(isExternal) {
          target = 'target';
          rel = 'rel';
          blank = '_blank';
          noopener = 'noopener';
          attr1 = elemAttribute(link, target);
          attr2 = elemAttribute(link, rel);

          attr1 ? false : elemAttribute(link, target, blank);
          attr2 ? false : elemAttribute(link, rel, noopener);
        }
      });
    }
  })();

  let headingNodes = [], results, link, icon, current, id,
  tags = ['h2', 'h3', 'h4', 'h5', 'h6'];

  current = document.URL;

  tags.forEach(function(tag){
    const article = elem('.post_content');
    if (article) {
      results = article.getElementsByTagName(tag);
      Array.prototype.push.apply(headingNodes, results);
    }
  });

  headingNodes.forEach(function(node){
    link = createEl('a');
    link.className = 'link icon';
    link.style.backgroundImage = `url(${baseURL}${iconsPath}link.svg)`;
    id = node.getAttribute('id');
    if(id) {
      link.href = `${current}#${id}`;
      node.appendChild(link);
      pushClass(node, 'link_owner');
    }
  });

  let inlineListItems = elems('ol li');
  if(inlineListItems) {
    inlineListItems.forEach(function(listItem){
      let firstChild = listItem.children[0]
      let containsHeading = isMatch(firstChild, tags);
      containsHeading ? pushClass(listItem, 'align') : false;
    })
  }

  function copyFeedback(parent) {
    const copyText = document.createElement('div');
    const yanked = 'link_yanked';
    copyText.classList.add(yanked);
    copyText.innerText = 'Link Copied';
    if(!elem(`.${yanked}`, parent)) {
      parent.appendChild(copyText);
      setTimeout(function() {
        parent.removeChild(copyText)
      }, 3000);
    }
  }

  (function copyHeadingLink() {
    let deeplink, deeplinks, newLink, parent, target;
    deeplink = 'link';
    deeplinks = elems(`.${deeplink}`);
    if(deeplinks) {
      document.addEventListener('click', function(event)
      {
        target = event.target;
        parent = target.parentNode;
        if (target && containsClass(target, deeplink) || containsClass(parent, deeplink)) {
          event.preventDefault();
          newLink = target.href != undefined ? target.href : target.parentNode.href;
          copyToClipboard(newLink);
          target.href != undefined ?  copyFeedback(target) : copyFeedback(target.parentNode);
        }
      });
    }
  })();

  (function copyLinkToShare() {
    let  copy, copied, excerpt, isCopyIcon, isInExcerpt, link, postCopy, postLink, target;
    copy = 'copy';
    copied = 'copy_done';
    excerpt = 'excerpt';
    postCopy = 'post_copy';
    postLink = 'post_card';

    doc.addEventListener('click', function(event) {
      target = event.target;
      isCopyIcon = containsClass(target, copy);
      let isWithinCopyIcon = target.closest(`.${copy}`);
      if (isCopyIcon || isWithinCopyIcon) {
        let icon = isCopyIcon ? isCopyIcon : isWithinCopyIcon;
        isInExcerpt =  containsClass(icon, postCopy);
        if (isInExcerpt) {
          link = target.closest(`.${excerpt}`).previousElementSibling;
          link = containsClass(link, postLink)? elemAttribute(link, 'href') : false;
        } else {
          link = window.location.href;
        }
        if(link) {
          copyToClipboard(link);
          pushClass(icon, copied);
        }
      }
      const yankLink = '.link_yank';
      const isCopyLink = target.matches(yankLink);
      const isCopyLinkIcon = target.closest(yankLink);

      if(isCopyLink || isCopyLinkIcon) {
        event.preventDefault();
        const yankContent = isCopyLinkIcon ? elemAttribute(target.closest(yankLink), 'href') : elemAttribute(target, 'href');
        copyToClipboard(yankContent);
        isCopyLink ?  copyFeedback(target) : copyFeedback(target.parentNode);
      }
    });
  })();

  (function hideAside(){
    let aside, title, posts;
    aside = elem('.aside');
    title = aside ? aside.previousElementSibling : null;
    if(aside && title.nodeName.toLowerCase() === 'h3') {
      posts = Array.from(aside.children);
      posts.length < 1 ? title.remove() : false;
    }
  })();

  (function goBack() {
    let backBtn = elem('.btn_back');
    let history = window.history;
    if (backBtn) {
      backBtn.addEventListener('click', function(){
        history.back();
      });
    }
  })();

  const tables = elems('table');
  if (tables) {
    const scrollable = 'scrollable';
    tables.forEach(function(table) {
      const wrapper = createEl();
      wrapper.className = scrollable;
      wrapEl(table, wrapper);
    });
  }

  function toggleTags(target = null) {
    const tagsButtonClass = 'post_tags_toggle';
    const tagsButtonClass2 = 'tags_hide';
    const tagsShowClass = 'jswidgetopen';
    const postTagsWrapper = elem(`.${tagsShowClass}`);
    target = target === null ? postTagsWrapper : target;
    const showingAllTags = target.matches(`.${tagsShowClass}`);
    const isExandButton = target.matches(`.${tagsButtonClass}`);
    const isCloseButton = target.matches(`.${tagsButtonClass2}`) || target.closest(`.${tagsButtonClass2}`);
    const isButton =  isExandButton || isCloseButton;
    const isActionable = isButton || showingAllTags;

    if(isActionable) {
      if(isButton) {
        if(isExandButton) {
          let allTagsWrapper = target.nextElementSibling
          pushClass(allTagsWrapper, tagsShowClass);
        } else {
          deleteClass(postTagsWrapper, tagsShowClass);
        }
      } else {
        isActionable ? deleteClass(target, tagsShowClass) : false;
      }
    }
  }

  (function showAllPostTags(){
    doc.addEventListener('click', function(event){
      const target = event.target;
      toggleTags(target)
    });

    horizontalSwipe(doc, toggleTags, 'left');
  })();

  (function navToggle() {
    doc.addEventListener('click', function(event){
      const target = event.target;
      const open = 'jsopen';
      const navCloseIconClass = '.nav_close';
      const navClose = elem(navCloseIconClass);
      const isNavToggle = target.matches(navCloseIconClass) || target.closest(navCloseIconClass);
      const harmburgerIcon = navClose.firstElementChild.firstElementChild;
      if(isNavToggle) {
        event.preventDefault();
        modifyClass(doc, open);
        modifyClass(harmburgerIcon, 'isopen');
      }

      if(!target.closest('.nav') && elem(`.${open}`)) {
        modifyClass(doc, open);
        let navIsOpen = containsClass(doc, open);
        !navIsOpen  ? modifyClass(harmburgerIcon, 'isopen') : false;
      }

      const navItem = 'nav_item';
      const navSub = 'nav_sub';
      const showSub = 'nav_open';
      const isNavItem = target.matches(`.${navItem}`);
      const isNavItemIcon = target.closest(`.${navItem}`)

      if(isNavItem || isNavItemIcon) {
        const thisItem = isNavItem ? target : isNavItemIcon;
        const hasNext = thisItem.nextElementSibling
        const hasSubNav = hasNext ? hasNext.matches(`.${navSub}`) : null;
        if (hasSubNav) {
          event.preventDefault();
          Array.from(thisItem.parentNode.parentNode.children).forEach(function(item){
            const targetItem = item.firstElementChild;
            targetItem != thisItem ? deleteClass(targetItem, showSub) : false;
          });
          modifyClass(thisItem, showSub);
        }
      }
    });
  })();

  function isMobileDevice() {
    const agent = navigator.userAgent.toLowerCase();
    const isMobile = agent.includes('android') || agent.includes('iphone');
    return  isMobile;
  };

  (function ifiOS(){
    // modify backto top button
    const backToTopButton = elem('.to_top');
    if (backToTopButton === null) return;
    const thisOS = getMobileOperatingSystem();
    const ios = 'ios';
    if(backToTopButton && thisOS === 'iOS') {
      pushClass(backToTopButton, ios);
    }
    // precisely position back to top button on large screens
    const buttonParentWidth = backToTopButton.parentNode.offsetWidth;
    const docWidth = doc.offsetWidth;
    let leftOffset = (docWidth - buttonParentWidth) / 2;
    const buttonWidth = backToTopButton.offsetWidth;
    leftOffset = leftOffset + buttonParentWidth - buttonWidth;
    if(!isMobileDevice()){
      backToTopButton.style.left = `${leftOffset}px`;
    }
  })();

  (function sortTags() {
    doc.addEventListener('click', function(event){
      const active = 'active';
      const target = event.target;
      const isSortButton = target.matches('.tags_sort') || target.matches('.tags_sort span');
      if(isSortButton) {
        const tagsList = target.closest('.tags_list');
        const sortButton = elem('.tags_sort', tagsList);
        modifyClass(sortButton, 'sorted');
        const tags = elems('.post_tag', tagsList);
        Array.from(tags).forEach(function(tag){
          const order = tag.dataset.position;
          const reverseSorting = containsClass(tag, active);
          tag.style.order = reverseSorting ? 0 : -order;
          modifyClass(tag, active);
        })
      }
    })
  })();

  (function shareViaLinkedin() {
    doc.addEventListener('click', function(event){
      const linkedin = '.linkedin';
      const target = event.target;
      if(target.matches(linkedin) || target.closest(linkedin)) {
        window.open('http://www.linkedin.com/shareArticle?mini=true&url='+encodeURIComponent(window.location.href), '', 'left=0,top=0,width=650,height=420,personalbar=0,toolbar=0,scrollbars=0,resizable=0');
      }
    });
  })();

  // add new code above this line
}

window.addEventListener(pageHasLoaded, fileClosure());
