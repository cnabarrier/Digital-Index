// Theme
function toggleTheme(){
  const t = document.documentElement.getAttribute('data-theme')==='dark'?'light':'dark';
  document.documentElement.setAttribute('data-theme',t);
  document.getElementById('themeLabel').textContent = t==='dark'?'☀️':'🌙';
  localStorage.setItem('avTheme',t);
}
(function(){const s=localStorage.getItem('avTheme');if(s){document.documentElement.setAttribute('data-theme',s);document.getElementById('themeLabel').textContent=s==='dark'?'☀️':'🌙';}})();

// Zulu Clock
function updateZulu(){
  const d=new Date();
  const h=String(d.getUTCHours()).padStart(2,'0');
  const m=String(d.getUTCMinutes()).padStart(2,'0');
  const s=String(d.getUTCSeconds()).padStart(2,'0');
  document.getElementById('zuluClock').textContent=h+':'+m+':'+s+' Z';
}
updateZulu();setInterval(updateZulu,1000);

// Section metadata
const sectionMeta={
  international:{label:'ICAO Annexes',icon:'🌏'},
  primary:{label:'Acts & Regulations',icon:'⚖️'},
  casr:{label:'CASR Parts',icon:'📘'},
  mos:{label:'Manuals of Standards',icon:'📖'},
  caos:{label:'Civil Aviation Orders',icon:'📋'},
  supporting:{label:'Supporting',icon:'📎'}
};

// Navigation
function showHome(){
  document.getElementById('homeView').style.display='flex';
  document.querySelectorAll('.section-view').forEach(s=>s.classList.remove('active'));
  // Reset shelf filter to All Sections
  var allTab=document.querySelector('.shelf-tab[data-filter="all"]');
  if(allTab)filterSection('all',allTab);
  window.scrollTo({top:0,behavior:'smooth'});
  renderRecent();
}
function showSection(id){
  document.getElementById('homeView').style.display='none';
  document.querySelectorAll('.section-view').forEach(s=>s.classList.remove('active'));
  document.getElementById('sec-'+id).classList.add('active');
  window.scrollTo({top:0,behavior:'smooth'});
}

// Toggle accordion — track specific part in recent
function tog(el){
  const cp=el.closest('.cp');
  cp.classList.toggle('open');
  if(cp.classList.contains('open')){
    const cn=cp.querySelector('.cn');
    const ct=cp.querySelector('.ct');
    const sec=cp.closest('.section-view');
    if(cn&&sec){
      const secId=sec.id.replace('sec-','');
      const m=sectionMeta[secId]||{icon:'📄'};
      const code=cn.textContent.trim();
      const title=ct?ct.textContent.trim():'';
      addRecentItem({id:secId+':'+code,label:code+(title?' — '+title:''),icon:m.icon,section:secId,search:code.toLowerCase()});
    }
  }
}

// Recent items (localStorage) — tracks specific items, not just categories
function getRecent(){try{return JSON.parse(localStorage.getItem('avRecent'))||[];}catch(e){return[];}}
function addRecentItem(item){
  let recent=getRecent().filter(r=>typeof r==='object'&&r.id!==item.id);
  recent.unshift(item);
  if(recent.length>8)recent=recent.slice(0,8);
  localStorage.setItem('avRecent',JSON.stringify(recent));
}
function clearRecent(){localStorage.removeItem('avRecent');renderRecent();}
function openRecent(secId,search){
  showSection(secId);
  setTimeout(()=>{
    const secEl=document.getElementById('sec-'+secId);
    if(!secEl)return;
    secEl.querySelectorAll('.cp').forEach(cp=>{
      const cn=cp.querySelector('.cn');
      if(cn&&cn.textContent.trim().toLowerCase()===search){
        cp.classList.add('open');
        setTimeout(()=>cp.scrollIntoView({behavior:'smooth',block:'center'}),100);
      }
    });
  },50);
}
function renderRecent(){
  const sec=document.getElementById('recentSection');
  const list=document.getElementById('recentList');
  const recent=getRecent().filter(r=>typeof r==='object'&&r.id);
  if(!recent.length){sec.style.display='none';return;}
  sec.style.display='';
  list.innerHTML=recent.map(r=>{
    if(r.url)return '<a class="pill" href="'+r.url+'" target="_blank"><span class="pill-icon">'+r.icon+'</span>'+r.label+'</a>';
    if(r.search)return '<a class="pill" href="#" onclick="openRecent(\''+r.section+"','"+r.search.replace(/'/g,"\\'")+"');return false\"><span class=\"pill-icon\">"+r.icon+'</span>'+r.label+'</a>';
    return '<a class="pill" href="#" onclick="showSection(\''+r.section+'\');return false"><span class="pill-icon">'+r.icon+'</span>'+r.label+'</a>';
  }).join('');
}
// Track leg-card link clicks as recent items
document.addEventListener('click',e=>{
  const link=e.target.closest('.leg-card-link');
  if(!link)return;
  const card=link.closest('.leg-card');
  const sec=card&&card.closest('.section-view');
  if(!card||!sec)return;
  const secId=sec.id.replace('sec-','');
  const m=sectionMeta[secId]||{icon:'📄'};
  const title=card.querySelector('.leg-card-title');
  if(title)addRecentItem({id:'link:'+title.textContent.trim(),label:title.textContent.trim(),icon:m.icon,section:secId,url:link.href});
});

// Popular (static)
function renderPopular(){
  const items=[
    {id:'casr',label:'CASR Parts',icon:'📘'},
    {id:'mos',label:'Manuals of Standards',icon:'📖'},
    {id:'primary',label:'Acts & Regulations',icon:'⚖️'},
    {id:'international',label:'ICAO Annexes',icon:'🌏'},
    {id:'supporting',label:'Supporting',icon:'📎'}
  ];
  document.getElementById('popularList').innerHTML=items.map(p=>
    '<a class="pill" onclick="showSection(\''+p.id+'\');return false" href="#"><span class="pill-icon">'+p.icon+'</span>'+p.label+'</a>'
  ).join('');
}
renderPopular();
renderRecent();

// Shelf — 3D Book Data & Interaction
const BOOK_DATA={
  'chicago-convention':{title:'Chicago Convention 1944',section:'international',description:'Foundational treaty creating ICAO — 96 articles on airspace sovereignty, registration, and safety. The global framework that all national aviation law is built upon.',tag:'Convention',tags:['ICAO','Treaty','1944','96 Articles'],url:'https://www.icao.int/publications/pages/doc7300.aspx'},
  'annex-1':{title:'Annex 1 — Personnel Licensing',section:'international',description:'Licensing standards for pilots, controllers, maintenance technicians, and dispatchers. Includes medical standards for aviation personnel worldwide.',tag:'ICAO Annex',tags:['ICAO','Licensing','Medical','Personnel'],url:'https://store.icao.int/en/annexes/annex-1'},
  'ca-act-1988':{title:'Civil Aviation Act 1988',section:'primary',description:'The principal Act establishing CASA and providing for Air Operator Certificates. Section 3A defines the core objective: maintaining, enhancing and promoting aviation safety.',tag:'Act',tags:['Parliament','CASA','AOC','Primary Law'],url:'https://www.legislation.gov.au/C2004A03656/latest/text'},
  'casr-1998':{title:'Civil Aviation Safety Regulations 1998',section:'casr',description:'The principal subordinate regulations made under the Civil Aviation Act 1988. Covers certification, operations, licensing, airworthiness, and more across 5 volumes.',tag:'Regulation',tags:['Subordinate','5 Volumes','40+ Parts'],browse:'casr',url:'https://www.legislation.gov.au/F1998B00220/latest/text'},
  'mos-all':{title:'Manuals of Standards (MOS)',section:'mos',description:'Technical standards and specifications made under the CASR. Covering licensing, operations, aerodromes, maintenance organisations, and aeronautical services across 20+ parts.',tag:'MOS',tags:['Standards','20+ Parts','Technical','CASR Companion'],browse:'mos',url:'https://www.casa.gov.au/rules/regulatory-framework/manuals-standards'},
  'caos':{title:'Civil Aviation Orders (CAOs)',section:'supporting',description:'Technical standards complementing the Civil Aviation Regulations. Being progressively replaced by Manuals of Standards as CASA modernises the regulatory framework.',tag:'Orders',tags:['Technical','Legacy','CAR Complement'],browse:'caos',browseLabel:'Orders',url:'https://www.casa.gov.au/rules/regulatory-framework/civil-aviation-orders'},
  'aip':{title:'Aeronautical Information Publication (AIP)',section:'supporting',description:'Operational information for pilots — ATC procedures, airspace structure, navigation aids, aerodrome data. Published and maintained by Airservices Australia.',tag:'Publication',tags:['Pilots','ATC','Airspace','Navaids'],url:'https://www.airservicesaustralia.com/aip/aip.asp'}
};
let activeBookId=null,activeBookEl=null;
const _reducedMotion=window.matchMedia('(prefers-reduced-motion:reduce)');

function openBook(id){
  const data=BOOK_DATA[id];if(!data)return;
  const viewer=document.getElementById('bookViewer');
  const book=document.getElementById('bookViewerBook');
  const backdrop=document.getElementById('shelfBackdrop');

  activeBookId=id;
  activeBookEl=document.querySelector('.shelf-book[data-id="'+id+'"]');

  // Populate cover
  document.getElementById('bookCoverTitle').textContent=data.title;
  document.getElementById('bookCoverTag').textContent=data.tag;
  viewer.setAttribute('data-section',data.section);

  // Populate left page
  const colors={international:'#0c2d6a',primary:'#7a5500',casr:'#0a6a38',mos:'#8a1535',supporting:'#4a1a75'};
  const meta=sectionMeta[data.section]||{label:data.section,icon:''};
  document.getElementById('detailPageNumL').textContent=meta.icon+' '+meta.label;
  document.getElementById('detailSection').textContent=data.tag;
  document.getElementById('detailSection').style.color=colors[data.section]||'#333';
  document.getElementById('detailTitle').textContent=data.title;
  document.getElementById('detailDesc').textContent=data.description;
  document.getElementById('detailTags').innerHTML=data.tags.map(t=>'<span class="shelf-detail-tag">'+t+'</span>').join('');

  // Populate right page
  document.getElementById('detailPageNumR').textContent='Reference Guide';
  document.getElementById('detailRightTitle').textContent=data.title;
  var bodyHtml='<p style="margin-bottom:10px"><strong>Category:</strong> '+meta.label+'</p>';
  bodyHtml+='<p style="margin-bottom:10px"><strong>Type:</strong> '+data.tag+'</p>';
  bodyHtml+='<p style="margin-bottom:10px">'+data.description+'</p>';
  if(data.tags.length)bodyHtml+='<p style="margin-bottom:10px"><strong>Keywords:</strong> '+data.tags.join(', ')+'</p>';
  document.getElementById('detailRightBody').innerHTML=bodyHtml;

  let actions='';
  actions+='<button class="shelf-detail-btn primary" data-browse="'+(data.browse||data.section)+'">Browse '+(data.browseLabel||meta.label)+' &rarr;</button>';
  if(data.url)actions+='<a class="shelf-detail-btn secondary" href="'+data.url+'" target="_blank">View Document &rarr;</a>';
  document.getElementById('detailActions').innerHTML=actions;

  // Track in recent
  addRecentItem({id:'book:'+id,label:data.title,icon:meta.icon,section:data.section});

  document.body.style.overflow='hidden';

  if(_reducedMotion.matches){
    if(activeBookEl){activeBookEl.setAttribute('data-active','');activeBookEl.setAttribute('tabindex','-1');activeBookEl.setAttribute('aria-hidden','true');}
    backdrop.classList.add('active');
    book.style.transform='';
    viewer.classList.add('active');
    viewer.classList.add('open');
    document.getElementById('bookViewerCloseX').focus();
    return;
  }

  // "Reach" animation: lift book up from shelf before FLIP
  if(activeBookEl){
    var from=activeBookEl.getBoundingClientRect();
    // Add reaching class to lift the book up
    activeBookEl.classList.add('reaching');
    activeBookEl.style.transform='translateY(-40px) translateZ(60px) scale(1.1)';
    activeBookEl.style.zIndex='20';

    // After the lift, capture position and do FLIP
    setTimeout(function(){
      var liftedFrom=activeBookEl.getBoundingClientRect();
      // Now hide source card
      activeBookEl.setAttribute('data-active','');
      activeBookEl.setAttribute('tabindex','-1');
      activeBookEl.setAttribute('aria-hidden','true');

      backdrop.classList.add('active');

      var hasFlip=liftedFrom.width>0&&liftedFrom.height>0;
      if(hasFlip){
        var vw=window.innerWidth,vh=window.innerHeight;
        var bw=700,bh=460;
        var toX=(vw-bw)/2,toY=(vh-bh)/2;
        var sx=liftedFrom.width/bw,sy=liftedFrom.height/bh;
        var tx=liftedFrom.left-toX,ty=liftedFrom.top-toY;
        book.style.transition='none';
        book.style.transform='translate('+tx+'px,'+ty+'px) scale('+sx+','+sy+')';
      }

      viewer.classList.add('active');

      if(hasFlip){
        void book.offsetHeight;
        book.style.transition='';
        book.style.transform='translate(0,0) scale(1)';

        var flyDone=false;
        function onFlyEnd(e){
          if(flyDone)return;
          if(e&&e.propertyName!=='transform')return;
          flyDone=true;
          book.removeEventListener('transitionend',onFlyEnd);
          book.style.transform='';
          viewer.classList.add('open');
          document.getElementById('bookViewerCloseX').focus();
        }
        book.addEventListener('transitionend',onFlyEnd);
        setTimeout(function(){onFlyEnd(null);},600);
      }else{
        viewer.classList.add('open');
        document.getElementById('bookViewerCloseX').focus();
      }
    },350); // Wait for lift animation
  }else{
    backdrop.classList.add('active');
    viewer.classList.add('active');
    viewer.classList.add('open');
    document.getElementById('bookViewerCloseX').focus();
  }
}

function closeBook(){
  const viewer=document.getElementById('bookViewer');
  const book=document.getElementById('bookViewerBook');
  const cover=document.getElementById('bookViewerCover');
  const backdrop=document.getElementById('shelfBackdrop');

  if(!viewer.classList.contains('active'))return;

  // Close cover first
  viewer.classList.remove('open');

  if(_reducedMotion.matches){
    _finishClose(viewer,book,backdrop);
    return;
  }

  var coverDone=false;
  function onCoverClose(e){
    if(coverDone)return;
    if(e&&e.propertyName!=='transform')return;
    coverDone=true;
    cover.removeEventListener('transitionend',onCoverClose);

    // Re-query source card (may have been filtered out)
    var sourceCard=document.querySelector('.shelf-book[data-id="'+activeBookId+'"]');
    var canFlipBack=sourceCard&&!sourceCard.hasAttribute('data-filtered-out');

    if(canFlipBack){
      // Read fresh rect of source card (temporarily make it visible)
      sourceCard.style.transition='none';
      sourceCard.style.opacity='1';
      var to=sourceCard.getBoundingClientRect();
      sourceCard.style.opacity='';
      sourceCard.style.transition='';

      var vw=window.innerWidth,vh=window.innerHeight;
      var bw=700,bh=460;
      var toX=(vw-bw)/2,toY=(vh-bh)/2;
      var sx=to.width/bw,sy=to.height/bh;
      var tx=to.left-toX,ty=to.top-toY;

      book.style.transform='translate('+tx+'px,'+ty+'px) scale('+sx+','+sy+')';
      backdrop.classList.remove('active');

      var flyBackDone=false;
      function onFlyBack(e2){
        if(flyBackDone)return;
        if(e2&&e2.propertyName!=='transform')return;
        flyBackDone=true;
        book.removeEventListener('transitionend',onFlyBack);
        _finishClose(viewer,book,backdrop);
      }
      book.addEventListener('transitionend',onFlyBack);
      setTimeout(function(){onFlyBack(null);},600);
    } else {
      // Can't FLIP back — just fade close
      _finishClose(viewer,book,backdrop);
    }
  }
  cover.addEventListener('transitionend',onCoverClose);
  // Safety fallback for cover close
  setTimeout(function(){onCoverClose(null);},700);
}

function _finishClose(viewer,book,backdrop){
  viewer.classList.remove('active');
  viewer.classList.remove('open');
  book.style.transform='';
  backdrop.classList.remove('active');
  document.body.style.overflow='';

  // Restore source card + clean up reaching state
  const sourceCard=activeBookId?document.querySelector('.shelf-book[data-id="'+activeBookId+'"]'):null;
  if(sourceCard){
    sourceCard.removeAttribute('data-active');
    sourceCard.removeAttribute('tabindex');
    sourceCard.removeAttribute('aria-hidden');
    sourceCard.classList.remove('reaching');
    sourceCard.style.transform='';
    sourceCard.style.zIndex='';
    sourceCard.focus();
  }else{
    const fallback=document.querySelector('.shelf-book:not([data-filtered-out])')||document.querySelector('.shelf-grid');
    if(fallback)fallback.focus();
  }

  activeBookId=null;
  activeBookEl=null;
}

function filterSection(section,el){
  const shelf=document.getElementById('shelf');
  document.querySelectorAll('.shelf-tab').forEach(t=>t.classList.remove('active'));
  el.classList.add('active');
  if(section==='all'){
    shelf.removeAttribute('data-shelf-section');
    document.querySelectorAll('.shelf-book').forEach(b=>b.removeAttribute('data-filtered-out'));
  }else{
    shelf.setAttribute('data-shelf-section',section);
    document.querySelectorAll('.shelf-book').forEach(b=>{
      if(b.dataset.section===section)b.removeAttribute('data-filtered-out');
      else b.setAttribute('data-filtered-out','');
    });
  }
}

// Search Index — built once at page load
let searchIndex=[];
function buildSearchIndex(){
  searchIndex=[];
  document.querySelectorAll('.cp').forEach(p=>{
    const sec=p.closest('.section-view');
    if(!sec)return;
    const secId=sec.id.replace('sec-','');
    const cn=p.querySelector('.cn');
    const ct=p.querySelector('.ct');
    const m=sectionMeta[secId]||{icon:'📄',label:secId};
    const code=cn?cn.textContent.trim():'';
    const title=ct?ct.textContent.trim():'';
    const hay=('casr mos cao civil aviation order orders safety regulations manual standards part '+
      (p.getAttribute('data-search')||'')+' '+p.textContent).toLowerCase();
    searchIndex.push({code,title,sectionId:secId,icon:m.icon,sectionLabel:m.label,type:'cp',el:p,haystack:hay});
  });
  document.querySelectorAll('.leg-card').forEach(c=>{
    const sec=c.closest('.section-view');
    if(!sec)return;
    const secId=sec.id.replace('sec-','');
    const m=sectionMeta[secId]||{icon:'📄',label:secId};
    const titleEl=c.querySelector('.leg-card-title');
    const descEl=c.querySelector('.leg-card-desc');
    const code=titleEl?titleEl.textContent.trim():'';
    const title=descEl?descEl.textContent.trim().split('\n')[0]:'';
    const hay=('casr car cao mos icao annex '+(c.getAttribute('data-search')||'')+' '+c.textContent).toLowerCase();
    searchIndex.push({code,title,sectionId:secId,icon:m.icon,sectionLabel:m.label,type:'card',el:c,haystack:hay});
  });
}

// Dropdown state
let _ddActiveIdx=-1;
let _ddItems=[];
let _ddNavigating=false;

function showDropdown(q){
  const dropdown=document.getElementById('searchDropdown');
  const list=document.getElementById('searchDropdownList');
  if(!q||q.length<1){hideDropdown();return;}
  const words=q.toLowerCase().split(/\s+/).filter(w=>w.length>0);
  let matches=searchIndex.filter(e=>{
    if(activeSearchFilter!=='all'&&e.sectionId!==activeSearchFilter)return false;
    return words.every(w=>e.haystack.includes(w));
  });
  if(!matches.length){
    list.innerHTML='<div class="search-dd-empty">No matches</div>';
    dropdown.classList.add('show');
    _ddItems=[];_ddActiveIdx=-1;
    return;
  }
  // Limit and group by section
  matches=matches.slice(0,20);
  const grouped={};
  matches.forEach(m=>{
    if(!grouped[m.sectionId])grouped[m.sectionId]=[];
    grouped[m.sectionId].push(m);
  });
  let html='';
  Object.keys(grouped).forEach(secId=>{
    const items=grouped[secId];
    const meta=sectionMeta[secId]||{label:secId,icon:'📄'};
    html+='<div class="search-dd-section-hdr">'+meta.icon+' '+meta.label+'</div>';
    items.forEach((item,i)=>{
      const title=item.type==='card'?item.title:item.title;
      html+='<div class="search-dd-item" data-dd-idx="'+secId+'-'+i+'" role="option">';
      html+='<span class="search-dd-icon">'+item.icon+'</span>';
      html+='<span class="search-dd-code">'+_escHtml(item.code)+'</span>';
      if(title)html+='<span class="search-dd-title">'+_escHtml(title)+'</span>';
      html+='<span class="search-dd-badge">'+meta.label+'</span>';
      html+='</div>';
    });
  });
  list.innerHTML=html;
  dropdown.classList.add('show');
  // Store flat item list for keyboard nav
  _ddItems=matches;
  _ddActiveIdx=-1;
  // Bind click handlers
  list.querySelectorAll('.search-dd-item').forEach((el,i)=>{
    el.addEventListener('click',()=>navigateToItem(_ddItems[i]));
  });
}

function hideDropdown(){
  document.getElementById('searchDropdown').classList.remove('show');
  _ddActiveIdx=-1;
  _ddItems=[];
}

function _setDdActive(idx){
  const list=document.getElementById('searchDropdownList');
  const items=list.querySelectorAll('.search-dd-item');
  items.forEach(el=>el.classList.remove('active'));
  if(idx>=0&&idx<items.length){
    items[idx].classList.add('active');
    items[idx].scrollIntoView({block:'nearest'});
  }
  _ddActiveIdx=idx;
}

function navigateToItem(entry){
  _ddNavigating=true;
  hideDropdown();
  const secId=entry.sectionId;
  showSection(secId);
  if(entry.type==='cp'){
    entry.el.classList.add('open');
    setTimeout(()=>entry.el.scrollIntoView({behavior:'smooth',block:'center'}),100);
  }else{
    setTimeout(()=>entry.el.scrollIntoView({behavior:'smooth',block:'center'}),100);
  }
  // Track in recent
  const m=sectionMeta[secId]||{icon:'📄'};
  addRecentItem({id:secId+':'+entry.code,label:entry.code+(entry.title?' — '+entry.title:''),icon:m.icon,section:secId,search:entry.code.toLowerCase()});
  setTimeout(()=>{_ddNavigating=false;},200);
}

function _escHtml(s){return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');}

// Search filter state
let activeSearchFilter='all';
function setSearchFilter(section,el){
  activeSearchFilter=section;
  document.querySelectorAll('.sf-chip').forEach(c=>c.classList.remove('active'));
  if(el)el.classList.add('active');
  const q=document.getElementById('searchInput').value.trim();
  if(q){showDropdown(q);handleSearch(q);}
}

// Highlight helpers
function highlightText(container,words){
  const selectors='.leg-card-title,.leg-card-desc,.ct,.cn,.sn';
  container.querySelectorAll(selectors).forEach(el=>{
    const walk=document.createTreeWalker(el,NodeFilter.SHOW_TEXT);
    const nodes=[];
    while(walk.nextNode())nodes.push(walk.currentNode);
    nodes.forEach(node=>{
      let text=node.textContent;
      let html=text;
      words.forEach(w=>{
        const re=new RegExp('('+w.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+')','gi');
        html=html.replace(re,'<mark class="search-hl">$1</mark>');
      });
      if(html!==text){
        const span=document.createElement('span');
        span.innerHTML=html;
        node.parentNode.replaceChild(span,node);
      }
    });
  });
}
function clearHighlights(){
  document.querySelectorAll('.search-hl').forEach(m=>{
    const parent=m.parentNode;
    parent.replaceChild(document.createTextNode(m.textContent),m);
    parent.normalize();
  });
  // Clean up wrapper spans
  document.querySelectorAll('.leg-card-title span,.leg-card-desc span,.ct span,.cn span,.sn span').forEach(s=>{
    if(!s.classList.length&&!s.id&&s.children.length===0){
      s.parentNode.replaceChild(document.createTextNode(s.textContent),s);
      s.parentNode&&s.parentNode.normalize&&s.parentNode.normalize();
    }
  });
}

// Search
function clearSearch(){
  document.getElementById('searchInput').value='';
  document.getElementById('searchBadge').classList.remove('show');
  document.getElementById('searchClear').classList.remove('show');
  document.getElementById('sec-search').classList.remove('active');
  document.querySelectorAll('.leg-card,.cp,.vol-label').forEach(el=>el.classList.remove('hidden'));
  document.querySelectorAll('.cp').forEach(p=>p.classList.remove('open'));
  hideDropdown();
  clearHighlights();
  // Reset filter chips
  activeSearchFilter='all';
  document.querySelectorAll('.sf-chip').forEach(c=>c.classList.toggle('active',c.dataset.sf==='all'));
  var filters=document.getElementById('searchFilters');
  if(filters)filters.classList.remove('show');
  document.querySelector('.page').classList.remove('with-filters');
  showHome();
}

function handleSearch(q){
  q=q.toLowerCase().trim();
  const badge=document.getElementById('searchBadge');
  const clear=document.getElementById('searchClear');

  if(!q){clearSearch();return;}

  clear.classList.add('show');
  clearHighlights();
  const words=q.split(/\s+/).filter(w=>w.length>0);

  const results=[];

  document.querySelectorAll('.leg-card').forEach(c=>{
    const hay=('casr car cao mos icao annex '+c.getAttribute('data-search')+' '+c.textContent).toLowerCase();
    if(words.every(w=>hay.includes(w)))results.push({type:'card',el:c});
  });

  document.querySelectorAll('.cp').forEach(p=>{
    const hay=('casr mos cao civil aviation order orders safety regulations manual standards part '+p.getAttribute('data-search')+' '+p.textContent).toLowerCase();
    if(words.every(w=>hay.includes(w)))results.push({type:'part',el:p});
  });

  // Apply section filter
  if(activeSearchFilter!=='all'){
    for(let i=results.length-1;i>=0;i--){
      const sec=results[i].el.closest('.section-view');
      if(sec&&sec.id.replace('sec-','')!==activeSearchFilter)results.splice(i,1);
    }
  }

  badge.textContent=results.length+' found';
  badge.classList.add('show');

  if(results.length===0){
    document.getElementById('homeView').style.display='none';
    document.querySelectorAll('.section-view').forEach(s=>s.classList.remove('active'));
    document.getElementById('sec-search').classList.add('active');
    document.getElementById('searchResults').innerHTML='<p style="color:var(--text-muted);padding:48px 0;text-align:center">No results found. Try different keywords.</p>';
    return;
  }

  const sections=new Set();
  results.forEach(r=>{
    const sec=r.el.closest('.section-view');
    if(sec)sections.add(sec.id);
  });

  if(sections.size===1){
    const secId=[...sections][0].replace('sec-','');
    showSection(secId);
    const secEl=document.getElementById([...sections][0]);

    secEl.querySelectorAll('.leg-card').forEach(c=>{
      const hay=('casr car cao mos icao annex '+c.getAttribute('data-search')+' '+c.textContent).toLowerCase();
      c.classList.toggle('hidden',!words.every(w=>hay.includes(w)));
    });
    secEl.querySelectorAll('.cp').forEach(p=>{
      const hay=('casr mos cao civil aviation order orders safety regulations manual standards part '+p.getAttribute('data-search')+' '+p.textContent).toLowerCase();
      const match=words.every(w=>hay.includes(w));
      p.classList.toggle('hidden',!match);
      if(match)p.classList.add('open');else p.classList.remove('open');
    });
    secEl.querySelectorAll('.vol-label').forEach(v=>{
      let next=v.nextElementSibling;let vis=false;
      while(next&&!next.classList.contains('vol-label')&&!next.classList.contains('section-back')){
        if(next.classList.contains('cp')&&!next.classList.contains('hidden')){vis=true;break;}
        next=next.nextElementSibling;
      }
      v.classList.toggle('hidden',!vis);
    });
    highlightText(secEl,words);
  } else {
    document.getElementById('homeView').style.display='none';
    document.querySelectorAll('.section-view').forEach(s=>s.classList.remove('active'));
    document.getElementById('sec-search').classList.add('active');
    document.getElementById('searchResultsTitle').textContent='🔍 '+results.length+' Results';

    // Section counts
    const secCounts={};
    results.forEach(r=>{
      const sec=r.el.closest('.section-view');
      if(sec){
        const sid=sec.id.replace('sec-','');
        const m=sectionMeta[sid]||{label:sid};
        secCounts[sid]=(secCounts[sid]||{count:0,label:m.label});
        secCounts[sid].count++;
      }
    });
    const countParts=Object.values(secCounts).map(s=>'<span>'+s.count+'</span> in '+s.label);

    const container=document.getElementById('searchResults');
    container.innerHTML=(countParts.length?'<p class="search-results-sub">'+countParts.join(' · ')+'</p>':'')+'<div class="cards-grid"></div>';
    const grid=container.querySelector('.cards-grid');

    results.forEach(r=>{
      const clone=r.el.cloneNode(true);
      if(r.type==='part'){clone.classList.add('open');}
      clone.querySelectorAll('.ch').forEach(ch=>ch.setAttribute('onclick','this.closest(\'.cp\').classList.toggle(\'open\')'));
      grid.appendChild(clone);
    });
    highlightText(container,words);
  }
}

// Keyboard shortcuts + focus trap
document.addEventListener('keydown',e=>{
  if(e.key==='/'&&document.activeElement.tagName!=='INPUT'){e.preventDefault();document.getElementById('searchInput').focus();}
  if(e.key==='Escape'){
    if(activeBookId){closeBook();return;}
    if(document.getElementById('searchDropdown').classList.contains('show')){hideDropdown();return;}
    clearSearch();document.getElementById('searchInput').blur();
  }
  // Dropdown keyboard nav
  if(document.activeElement.id==='searchInput'&&_ddItems.length>0){
    if(e.key==='ArrowDown'){e.preventDefault();_setDdActive(Math.min(_ddActiveIdx+1,_ddItems.length-1));return;}
    if(e.key==='ArrowUp'){e.preventDefault();_setDdActive(Math.max(_ddActiveIdx-1,-1));return;}
    if(e.key==='Enter'&&_ddActiveIdx>=0){e.preventDefault();navigateToItem(_ddItems[_ddActiveIdx]);return;}
  }
  if((e.key==='Enter'||e.key===' ')&&document.activeElement.classList.contains('shelf-book')){e.preventDefault();document.activeElement.click();}
  // Focus trap inside book viewer
  if(e.key==='Tab'&&activeBookId){
    const viewer=document.getElementById('bookViewer');
    const focusable=viewer.querySelectorAll('button:not([disabled]),a,[tabindex]:not([tabindex="-1"])');
    if(!focusable.length)return;
    const first=focusable[0],last=focusable[focusable.length-1];
    if(e.shiftKey){
      if(document.activeElement===first){e.preventDefault();last.focus();}
    }else{
      if(document.activeElement===last){e.preventDefault();first.focus();}
    }
  }
});

// Back to top
window.addEventListener('scroll',()=>{document.getElementById('btt').classList.toggle('show',window.scrollY>300);});

// === Event binding (no inline onclick) ===
(function initEvents(){
  buildSearchIndex();
  // Book cards — event delegation on shelf scene (covers both grids)
  const scene=document.querySelector('.shelf-scene');
  if(scene)scene.addEventListener('click',function(e){
    const btn=e.target.closest('.shelf-book');
    if(btn&&btn.dataset.id)openBook(btn.dataset.id);
  });

  // Close book: close button(s)
  document.getElementById('bookViewerClose').addEventListener('click',closeBook);
  document.getElementById('bookViewerCloseX').addEventListener('click',closeBook);

  // Close book: backdrop click
  document.getElementById('shelfBackdrop').addEventListener('click',closeBook);

  // Close book: click outside the book inside viewer
  document.getElementById('bookViewer').addEventListener('click',function(e){
    if(e.target===this)closeBook();
  });

  // Shelf filter tabs — event delegation
  const tabs=document.querySelector('.shelf-tabs');
  if(tabs)tabs.addEventListener('click',function(e){
    const tab=e.target.closest('.shelf-tab');
    if(tab&&tab.dataset.filter)filterSection(tab.dataset.filter,tab);
  });

  // Topbar logo
  document.getElementById('topbarLogo').addEventListener('click',showHome);

  // Theme toggle + label
  document.getElementById('themeToggle').addEventListener('click',toggleTheme);
  document.getElementById('themeLabel').addEventListener('click',toggleTheme);

  // Search input — dropdown + full search
  document.getElementById('searchInput').addEventListener('input',function(){
    const q=this.value.trim();
    showDropdown(q);
    if(!_ddNavigating)handleSearch(this.value);
  });
  // Show filter bar on focus
  document.getElementById('searchInput').addEventListener('focus',function(){
    var filters=document.getElementById('searchFilters');
    if(filters){filters.classList.add('show');document.querySelector('.page').classList.add('with-filters');}
  });
  // Click outside dropdown closes it
  document.addEventListener('click',function(e){
    if(!e.target.closest('.search-container'))hideDropdown();
  });
  // Search filter chips
  var filtersBar=document.getElementById('searchFilters');
  if(filtersBar)filtersBar.addEventListener('click',function(e){
    var chip=e.target.closest('.sf-chip');
    if(chip&&chip.dataset.sf)setSearchFilter(chip.dataset.sf,chip);
  });

  // Search clear
  document.getElementById('searchClear').addEventListener('click',clearSearch);

  // Section back links + search clear back — event delegation on .page
  document.querySelector('.page').addEventListener('click',function(e){
    const back=e.target.closest('.section-back');
    if(!back)return;
    e.preventDefault();
    if(back.dataset.action==='clear-search')clearSearch();
    else showHome();
  });

  // Detail actions — browse buttons (event delegation on viewer pages)
  document.getElementById('bookViewerPages').addEventListener('click',function(e){
    const btn=e.target.closest('[data-browse]');
    if(btn){closeBook();showSection(btn.dataset.browse);}
  });
})();
