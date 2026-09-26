let settingsDraft=null;
const flagCountryCodes=[
  'oceuadaeafagaialamanaoaqarasatauawazbabbbdbebfbgbhbibjbmbnbobrbsbtbvbwbybzcacccdcfcgchcickclcmcn',
  'cocrcucvcxcyczdedjdkdmdodzeceeegeheresetfifjfkfmfofrfxgagbgdgegfghgiglgmgngpgqgrgsgtgugwgyhkhmhn',
  'hrhthuidieilinioiqirisitjmjojpkekgkhkikmknkpkrkwkykzlalblclilklrlsltlulvlymamcmdmgmhmkmlmmmnmomp',
  'mqmrmsmtmumvmwmxmymznancnenfngninlnonpnrnunzompapepfpgphpkplpmpnprpsptpwpyqarerorurwsasbscsdsesg',
  'shsisjskslsmsnsosrstsvsysztctdtftgthtjtktmtntotltrtttvtwtzuaugumusuyuzvavcvevgvivnvuwfwsyeytrsza',
  'zmmezwxxa2o1axggimjeblmf'
].join('').match(/../g).map(code=>code.toUpperCase()).filter(code=>/^[A-Z]{2}$/.test(code)&&code!=='XX');
const flagRegionNames=typeof Intl.DisplayNames==='function'?new Intl.DisplayNames(['en'],{type:'region'}):null;
function flagCountryName(code){if(code==='XX')return 'no flag set';const name=flagRegionNames?.of(code);return name&&name!==code?name:code}
const setupOptions=[['desktop','pc','M3 4h18v13H3z M8 21h8 M12 17v4'],['mobile','mobile','M7 2h10v20H7z M10 18h4'],['mouse','mouse','M7 10a5 5 0 0 1 10 0v6a5 5 0 0 1-10 0z M12 5v5'],['tablet','tablet','M3 6h18v14H3z M7 16l9-12 3 2-9 12z'],['keyboard','keyboard','M2 6h20v13H2z M5 10h2 M10 10h2 M15 10h2 M6 15h12'],['touchscreen','touchscreen','M5 3h14v12 M10 21l-3-6 2-1 3 3V8h3v7l4 2v4'],['controller','controller','M7 7h10l4 4 1 7-3 2-4-4H9l-4 4-3-2 1-7z M5 11h6 M8 8v6 M16 10h1 M18 13h1'],['trackpad','trackpad','M3 4h18v16H3z M3 16h18 M12 16v4'],['mouse-only','mouse only','M7 10a5 5 0 0 1 10 0v6a5 5 0 0 1-10 0z M12 5v5'],['tablet-only','tablet only','M3 6h18v14H3z M7 16l9-12 3 2-9 12z'],['feet','feet','M9 3c-4 1-5 9-4 13s5 5 7 2-4-6-3-15z M17 5l2 1 M18 9l2 1'],['toaster','toaster','M3 10q0-4 4-4h10q4 0 4 4v10H3z M7 3h10 M7 10h10 M18 14v3'],['mind-control','mind control','M8 20v-4C0 9 8 1 14 4s8 11 2 13v3 M9 9l3 3 4-5'],['pure-luck','pure luck','M4 4h16v16H4z M8 8h1 M15 8h1 M11 12h1 M8 16h1 M15 16h1']];
function setupIcon(path){return '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="'+path+'"/></svg>'}
function setupBadges(value){const selected=new Set(String(value||'').split(','));return setupOptions.filter(([key])=>selected.has(key)).map(([key,label,path])=>'<span class="setup-badge" title="self-selected playstyle">'+setupIcon(path)+esc(label)+'</span>').join('')}
function syncSetup(form,preview){const selected=new Set(form.elements.profile_setup.value.split(',').filter(Boolean));form.querySelectorAll('.setup-options input').forEach(input=>input.checked=selected.has(input.value));form.querySelector('.setup-count').textContent=selected.size+' / 8 selected';preview.innerHTML=setupBadges(form.elements.profile_setup.value)}

function designSetup(form,account){
  const section=designElement('fieldset','setup-picker','<legend>your setup</legend><p>shown on your profile. choose up to 8, or leave it empty.</p><input type="hidden" name="profile_setup"><div class="setup-options"></div><small class="setup-count" role="status"></small>');
  const input=section.querySelector('input'),options=section.querySelector('.setup-options');input.value=account.profile_setup||'';
  for(const [key,label,path] of setupOptions){const choice=designElement('label','setup-choice',`<input type="checkbox" value="${key}">${setupIcon(path)}<span>${label}</span>`);options.append(choice);choice.querySelector('input').onchange=event=>{const checked=[...options.querySelectorAll('input:checked')];if(checked.length>8){event.target.checked=false;section.querySelector('.setup-count').textContent='choose up to 8';return}input.value=checked.map(x=>x.value).join(',');input.dispatchEvent(new Event('input',{bubbles:true}))}}
  form.querySelector('[data-settings-panel="profile"]').append(section);
}

function designElement(tag,className,html=''){
  const element=document.createElement(tag);element.className=className;element.innerHTML=html;return element;
}

function designNavigation(){
  const header=document.getElementById('site-header');if(!header||header.dataset.design)return;header.dataset.design='true';
  const footer=document.querySelector('.shell > footer'),links=designElement('nav','footer-links');links.setAttribute('aria-label','help and project');
  for(const key of ['appeal','staff']){const link=header.querySelector('[data-nav="'+key+'"]');if(link)links.append(link)}
  links.insertAdjacentHTML('beforeend','<a href="https://github.com/zigcho" target="_blank" rel="noreferrer">github ↗</a>');footer.append(links);
  const search=designElement('form','nav-player-search','<label><span class="visually-hidden">find a player</span><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/></svg><input name="player" placeholder="find a player" maxlength="32" autocomplete="off" required></label>');
  search.onsubmit=event=>{event.preventDefault();const name=search.elements.player.value.trim();if(name)location.href='/u/'+encodeURIComponent(name)};
  header.querySelector('.nav-secondary').prepend(search);
  document.addEventListener('pointerdown',event=>{const menu=document.querySelector('.nav-account-menu');if(menu&&!menu.contains(event.target))menu.open=false});
  document.addEventListener('focusin',event=>{const menu=document.querySelector('.nav-account-menu');if(menu&&!menu.contains(event.target))menu.open=false});
  document.addEventListener('keydown',event=>{const menu=document.querySelector('.nav-account-menu');if(event.key==='Escape'&&menu?.open){menu.open=false;menu.querySelector('summary').focus()}});
}

function designAccount(session){
  const current=document.getElementById('account-link');if(!current)return;
  const old=current.closest('.nav-account-menu')||current;
  if(!session){const link=designElement('a','nav-account','login');link.id='account-link';link.dataset.nav='account';link.href='/login';old.replaceWith(link);return}
  const menu=designElement('details','nav-account-menu',`<summary class="nav-account" id="account-link" data-nav="account"><span>${esc(session.user.name)}</span><svg viewBox="0 0 16 16" aria-hidden="true"><path d="m4 6 4 4 4-4"/></svg></summary><div class="nav-account-panel"><a href="/u/${encodeURIComponent(session.user.id)}">profile<span aria-hidden="true">↗</span></a><a href="/settings">settings<span aria-hidden="true">↗</span></a></div>`);
  old.replaceWith(menu);
}

function designProfile(p){
  const view=document.querySelector('.profile-view');if(!view||view.classList.contains('accent-bot')||view.dataset.design)return;view.dataset.design='true';view.classList.add('design-profile');
  if(p.profile_setup){const setup=designElement('div','profile-setup',setupBadges(p.profile_setup));setup.setAttribute('aria-label','self-selected setup and playstyle');view.querySelector('.profile-copy').append(setup)}
  const body=designElement('div','profile-columns'),rail=designElement('aside','profile-rail'),content=designElement('div','profile-content');rail.setAttribute('aria-label','player details');body.append(rail,content);
  const stats=view.querySelector('.profile-stats');if(stats){const lead=designElement('div','profile-lead-stats');for(const name of ['global rank','performance','accuracy','level']){const stat=[...stats.children].find(x=>x.querySelector('.label')?.textContent===name);if(stat)lead.append(stat)}view.querySelector('.profile-head').after(lead);stats.classList.add('profile-side-stats');rail.append(stats)}
  const bio=view.querySelector('.profile-bio');if(bio){const about=designElement('section','profile-about','<h2>about</h2>');about.append(bio);rail.prepend(about)}
  const engagement=view.querySelector('.profile-engagement');if(engagement)rail.append(engagement);
  const more=view.querySelector('#profile-more-stats');if(more){more.open=true;rail.append(more)}
  for(const node of [...view.children]){if(node.matches('.mode-bar,.profile-section-nav,.rank-history,.play-section,.section,.profile-extra-sections'))content.append(node)}
  view.append(body);
  const level=p.selected_stats;if(level){const progress=designElement('div','profile-level-progress',`<span>level ${fmt(level.level_current||1)}</span><span>${fmt(level.level_progress||0)}%</span><div><i style="width:${Math.max(0,Math.min(100,Number(level.level_progress)||0))}%"></i></div>`);rail.append(progress)}
  content.querySelectorAll('.section-head h2').forEach(title=>title.textContent=title.textContent.toLowerCase());
  const graph=content.querySelector('.rank-history'),nav=content.querySelector('.profile-section-nav');if(graph&&nav)nav.after(graph);
  designMedals(view);
}

function designMedals(view){
  view.querySelectorAll('.achievement').forEach(button=>{if(button.dataset.designTooltip)return;button.dataset.designTooltip='true';const place=()=>{const tooltip=button.querySelector('.achievement-tooltip');if(!tooltip)return;const rect=button.getBoundingClientRect(),width=Math.min(280,document.documentElement.clientWidth-32);tooltip.style.width=width+'px';tooltip.style.left=(Math.max(16,Math.min(document.documentElement.clientWidth-width-16,rect.left+rect.width/2-width/2))-rect.left)+'px';tooltip.style.transform='none'};button.addEventListener('pointerenter',place);button.addEventListener('focus',place)});
}

function designCountryPicker(account,profile){
  if(!(Number(account.privileges)&32))return;
  const choices=flagCountryCodes.map(code=>({code,name:flagCountryName(code)})).sort((a,b)=>a.name.localeCompare(b.name));
  const picker=designElement('section','settings-country-picker',`<div class="settings-country-head"><div><h3>country flag</h3><p>pick the flag on your profile and in game.</p></div><span>premium</span></div><details class="settings-flag-dropdown"><summary></summary><div class="settings-flag-menu"><label class="settings-flag-search"><span class="visually-hidden">search flags</span><input type="search" placeholder="search countries" autocomplete="off" aria-label="search countries"></label><div class="settings-flag-list" aria-label="country flags"></div></div></details><p class="settings-country-feedback" role="status" aria-live="polite"></p>`);
  profile.querySelector('[name="profile_accent"]').closest('.field').after(picker);
  const dropdown=picker.querySelector('details'),summary=dropdown.querySelector('summary'),search=picker.querySelector('input'),list=picker.querySelector('.settings-flag-list'),feedback=picker.querySelector('.settings-country-feedback');
  let selected=String(account.country||'XX').toUpperCase(),saving=false;
  const current=()=>{summary.innerHTML=`<span class="settings-selected-flag">${flag(selected)||'<span class="settings-flag-empty">?</span>'}</span><span class="settings-selected-name"><strong>${esc(flagCountryName(selected))}</strong><small>${esc(selected==='XX'?'choose a flag':selected)}</small></span><span class="settings-flag-chevron" aria-hidden="true">⌄</span>`};
  const render=query=>{const text=query.trim().toLocaleLowerCase();const matches=choices.filter(({code,name})=>!text||code.toLowerCase().includes(text)||name.toLocaleLowerCase().includes(text));list.innerHTML=matches.length?matches.map(({code,name})=>`<button type="button" class="settings-flag-option" data-country="${code}" aria-label="${esc(name)} flag, ${code}" ${code===selected?'aria-current="true"':''}>${flag(code)}<span>${esc(name)}</span><small>${code}</small></button>`).join(''):'<p class="settings-flag-empty-result">no matching flags.</p>'};
  current();render('');dropdown.addEventListener('toggle',()=>{if(dropdown.open){search.value='';render('');search.focus()}});search.addEventListener('input',()=>render(search.value));search.addEventListener('keydown',event=>{if(event.key==='Escape'){dropdown.open=false;summary.focus()}else if(event.key==='Enter'){event.preventDefault();list.querySelector('[data-country]')?.click()}});
  list.addEventListener('click',async event=>{const button=event.target.closest('[data-country]');if(!button||saving)return;const code=button.dataset.country;if(code===selected){dropdown.open=false;summary.focus();return}saving=true;feedback.classList.remove('is-error');feedback.textContent='saving flag…';list.querySelectorAll('button').forEach(option=>option.disabled=true);try{await accountRequest('/api/v1/account/country',{method:'POST',headers:{'content-type':'application/x-www-form-urlencoded'},body:new URLSearchParams({country:code})});selected=code;account.country=code;if(siteSession?.user)siteSession.user.country=code;current();feedback.textContent=`${flagCountryName(code)} saved.`;dropdown.open=false;picker.dispatchEvent(new Event('change',{bubbles:true}));summary.focus()}catch(error){feedback.classList.add('is-error');feedback.textContent=error.message}finally{saving=false;list.querySelectorAll('button').forEach(option=>option.disabled=false)}});
}

function designMediaButtons(zone,kind,hasCustom){
  const input=zone.querySelector('#'+kind+'-upload'),label=zone.querySelector('label[for="'+kind+'-upload"]');
  if(!input||!label)return;
  const noun=kind==='avatar'?'picture':'banner';
  const choose=designElement('button','action','upload '+noun);choose.type='button';choose.id=kind+'-upload-button';
  label.replaceWith(choose);input.tabIndex=-1;input.setAttribute('aria-hidden','true');choose.onclick=()=>input.click();
  const reset=zone.querySelector('#'+kind+'-reset');if(reset){reset.textContent='remove '+noun;reset.disabled=!hasCustom}
}

function designSettings(account){
  const shell=document.querySelector('.account-shell'),form=document.getElementById('account-settings');if(!shell||!form||shell.dataset.settingsDesign)return;shell.dataset.settingsDesign='true';shell.classList.add('design-settings');
  const heading=shell.querySelector(':scope > .intro');heading.innerHTML='<div><span class="eyebrow">your account</span><h1>settings<span>.</span></h1><p>profile, privacy and account access.</p></div><a class="quiet-action" href="/u/'+encodeURIComponent(account.name)+'">view profile ↗</a>';
  const session=shell.querySelector('.session-line'),avatar=shell.querySelector('.account-avatar-row'),extras=[...shell.querySelectorAll(':scope > .account-extra')],sections=[...form.querySelectorAll(':scope > .settings-section')];
  const layout=designElement('div','settings-layout'),side=designElement('aside','settings-sidebar'),editor=designElement('div','settings-editor'),panes=designElement('div','settings-panes');
  side.innerHTML=`<div class="settings-identity"><img src="https://a.kai.ovh/${account.id}?v=${account.avatar_version||0}" alt=""><span><strong>${esc(account.name)}</strong><small>account #${account.id}</small></span></div><nav aria-label="settings sections"></nav>`;
  const navigation=side.querySelector('nav'),groups=[];
  const add=(id,title,description,node,saves=false)=>{if(!node)return;node.classList.add('settings-pane');node.id='settings-'+id;node.dataset.settingsPanel=id;const head=node.querySelector('.settings-section-head');if(head){head.querySelector('h2').textContent=title;head.querySelector('p').textContent=description}groups.push({id,title,node,saves});navigation.insertAdjacentHTML('beforeend',`<button type="button" data-settings-tab="${id}" aria-controls="settings-${id}"><span>${title}</span><span aria-hidden="true">↗</span></button>`)};
  add('profile','profile','change how your profile appears.',sections[0],true);designCountryPicker(account,sections[0]);
  const appearance=designElement('section','settings-section','<div class="settings-section-head"><h2>appearance</h2><p>your picture and banner, on the web and in game.</p></div>');appearance.append(avatar);designMediaButtons(avatar,'avatar',account.has_custom_avatar);avatar.querySelector('.account-note').textContent='png, jpeg or gif · up to 2 mb · drop a file here or choose one';if(extras[0]){extras[0].querySelector('.settings-section-head').innerHTML='<h3>banner</h3><p>png, jpeg or gif · up to 4 mb · we fit it to the banner for you.</p>';appearance.append(extras[0]);designMediaButtons(extras[0],'banner',account.has_custom_banner)}add('appearance','appearance','your picture and banner, on the web and in game.',appearance);
  add('defaults','game defaults','choose the ruleset and score view your profile opens with.',sections[1],true);
  add('privacy','privacy','choose what other players can see. you and staff can still view your private profile details.',sections[2],true);sections[2].querySelector('[name="show_country"]').closest('.field').querySelector('span').textContent='show country flag';
  add('security','login & security','change your login details. changing your password or username signs you out everywhere.',extras[1]);
  add('team','team',account.team?'you are in ['+account.team.short_name+'] '+account.team.name+'.':'create a team, or join one from the teams page.',extras[2]);
  add('account','account details','the account behind the profile.',sections[3]);
  designSetup(form,account);
  const footer=form.querySelector('.settings-footer');footer.classList.add('settings-save-bar');const state=designElement('span','settings-save-state','no unsaved changes');state.setAttribute('role','status');footer.prepend(state);
  const oldSubmit=form.onsubmit;form.onsubmit=async event=>{await oldSubmit(event);if(form.querySelector('.form-good').textContent==='saved.'){baseline=new URLSearchParams(new FormData(form)).toString();updateDirty()}};
  panes.append(form);for(const group of groups)if(!form.contains(group.node))panes.append(group.node);
  const preview=designElement('aside','settings-live-preview',`<span class="eyebrow">profile preview</span><div class="settings-preview-banner">${account.has_custom_banner?`<img src="https://assets.kai.ovh/banners/${account.id}/cover.jpg?v=${account.banner_version||0}" alt="">`:''}</div><img class="settings-preview-avatar" src="https://a.kai.ovh/${account.id}?v=${account.avatar_version||0}" alt=""><div class="settings-preview-copy"><strong>${esc(account.name)}</strong><span data-preview-title></span><div class="settings-preview-roles">${roleBadges(account.privileges)}${account.team?`<span class="settings-preview-team">[${esc(account.team.short_name)}]</span>`:''}</div><div class="settings-preview-facts"><span data-preview-country></span><span>joined ${esc(when(account.created_at))}</span></div><small data-preview-details></small><span data-preview-website></span><p data-preview-bio></p><a href="/u/${encodeURIComponent(account.name)}">open your profile ↗</a></div>`);preview.setAttribute('aria-label','preview of unsaved profile changes');
  editor.append(panes,preview);layout.append(side,editor);shell.append(layout);if(session){session.classList.add('settings-account-session');side.append(session);session.querySelector('.session-user').remove()}
  const palette={pink:'#ed83b6',violet:'#ab94ff',blue:'#7bbcff',mint:'#82d5bb',gold:'#e7bd6d',red:'#ef7d87'};
  const accent=form.elements.profile_accent,swatches=designElement('div','accent-swatches');swatches.setAttribute('role','group');swatches.setAttribute('aria-label','profile accent');accent.after(swatches);accent.classList.add('visually-hidden');
  for(const [key,color] of Object.entries(palette)){const button=designElement('button','accent-swatch');button.type='button';button.style.setProperty('--swatch',color);button.setAttribute('aria-label',key);button.onclick=()=>{accent.value=key;accent.dispatchEvent(new Event('change',{bubbles:true}))};button.dataset.accent=key;swatches.append(button)}
  const bio=form.elements.bio,counter=designElement('small','bio-count');bio.after(counter);
  const previewSetup=designElement('div','profile-setup');preview.querySelector('.settings-preview-copy p').after(previewSetup);
  form.addEventListener('input',()=>{previewSetup.innerHTML=setupBadges(form.elements.profile_setup.value)});
  let baseline=new URLSearchParams(new FormData(form)).toString();
  if(settingsDraft?.user===account.id)for(const [key,value] of Object.entries(settingsDraft.values)){const input=form.elements.namedItem(key);if(input)input.value=value}
  function updateDirty(){const dirty=new URLSearchParams(new FormData(form)).toString()!==baseline;state.textContent=dirty?'you have unsaved changes':'all changes saved';footer.classList.toggle('is-dirty',dirty);shell.dataset.dirty=String(dirty);settingsDraft=dirty?{user:account.id,values:Object.fromEntries(new FormData(form))}:null}
  function updatePreview(){previewSetup.innerHTML=setupBadges(form.elements.profile_setup.value);form.querySelector(".setup-count").textContent=form.elements.profile_setup.value.split(",").filter(Boolean).length+" / 8 selected";preview.style.setProperty('--preview-accent',palette[accent.value]||palette.pink);preview.querySelector('[data-preview-title]').textContent=form.elements.profile_title.value||'your profile title';const country=preview.querySelector('[data-preview-country]');country.innerHTML=form.elements.show_country.value==='1'&&account.country!=='XX'?flag(account.country)+' '+esc(flagCountryName(account.country)):'';country.hidden=!country.innerHTML;preview.querySelector('[data-preview-details]').textContent=[form.elements.profile_pronouns.value,form.elements.profile_location.value].filter(Boolean).join(' · ');const website=preview.querySelector('[data-preview-website]');website.textContent=form.elements.profile_website.value?'website ↗':'';website.hidden=!website.textContent;preview.querySelector('[data-preview-bio]').textContent=bio.value||'a few words about you.';counter.textContent=bio.value.length+' / 500';swatches.querySelectorAll('button').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.accent===accent.value)));updateDirty()}
  syncSetup(form,previewSetup);form.addEventListener('input',updatePreview);form.addEventListener('change',updatePreview);updatePreview();
  function select(id,focus=false){const group=groups.find(g=>g.id===id)||groups[0];for(const other of groups)other.node.hidden=other!==group;navigation.querySelectorAll('button').forEach(button=>button.setAttribute('aria-current',button.dataset.settingsTab===group.id?'page':'false'));footer.hidden=!group.saves;preview.hidden=!['profile','appearance','defaults','privacy'].includes(group.id);editor.classList.toggle('without-preview',preview.hidden);if(focus)group.node.querySelector('input,select,textarea,button')?.focus();const url=new URL(location.href);url.searchParams.set('section',group.id);history.replaceState(null,'',url.pathname+url.search+url.hash)}
  navigation.querySelectorAll('button').forEach(button=>button.onclick=()=>select(button.dataset.settingsTab));form.addEventListener('invalid',event=>{const panel=event.target.closest('[data-settings-panel]');if(panel)select(panel.dataset.settingsPanel)},true);select(new URLSearchParams(location.search).get('section')||'profile');
  for(const id of ['avatar-upload','banner-upload']){const input=document.getElementById(id),zone=input?.closest('.account-avatar-row,.account-extra');if(!zone)continue;zone.classList.add('image-drop-zone');zone.ondragover=event=>{event.preventDefault();zone.classList.add('drag-over')};zone.ondragleave=()=>zone.classList.remove('drag-over');zone.ondrop=event=>{event.preventDefault();zone.classList.remove('drag-over');if(event.dataTransfer.files.length){input.files=event.dataTransfer.files;input.dispatchEvent(new Event('change',{bubbles:true}))}}}
}

function designPage(){
  designNavigation();const view=document.getElementById('app')?.firstElementChild;if(!view)return;
  document.body.dataset.view=view.dataset.pageType||(view.classList.contains('profile-view')?'profile':'content');
  if(!view.classList.contains('account-shell'))settingsDraft=null;
  if(view.dataset.pageType==='changelog')view.querySelectorAll('.changelog-build').forEach(build=>{const heading=build.querySelector('h2'),entry=build.querySelector('.changelog-entry:only-child>div>strong');if(heading&&entry&&heading.textContent===entry.textContent)entry.hidden=true});
  if(view.dataset.pageType==='home'&&!view.querySelector('.home-brand-mark')){const mark=designElement('span','home-brand-mark','kai<span>!</span>');mark.setAttribute('aria-hidden','true');view.querySelector('.page-head')?.append(mark)}
}

function designScore(entry){
  const score=entry.score,body=document.getElementById('score-dialog-body'),dialog=document.getElementById('score-dialog');dialog.classList.add('design-score');dialog.dataset.result=score.passed?'passed':'failed';
  const head=body.querySelector('.score-dialog-head'),summary=body.querySelector('.score-dialog-summary'),list=body.querySelector('.score-detail-list'),actions=body.querySelector('.score-dialog-actions');
  if(!score.passed){actions.querySelectorAll('a[download]').forEach(link=>link.remove());const replay=[...list.children].find(row=>row.firstElementChild.textContent==='replay');if(replay)replay.lastElementChild.textContent='not downloadable for failed plays'}
  const cover=designElement('img','score-cover');cover.src='/beatmaps/'+Number(score.set_id)+'/covers/cover.jpg';cover.alt='';cover.onerror=()=>cover.hidden=true;head.prepend(cover);
  const stars=[...summary.children].find(x=>x.querySelector('.label').textContent==='star rating');if(stars){const badge=designElement('span','score-chip score-stars',esc(stars.querySelector('.value').textContent));head.querySelector('.score-dialog-state').append(badge);stars.remove()}
  head.querySelector('.score-dialog-map').insertAdjacentHTML('afterend','<p class="score-played-by">played by <a href="/u/'+profileOwnerId+'">'+esc(activeProfileData?.name||'player')+'</a> · '+esc(when(score.submitted_at))+'</p>');
  const mods=designElement('section','score-mod-section','<h3>mods</h3><div>'+esc(scoreMods(score))+'</div>');summary.after(mods);
  const hits=designElement('section','score-hit-section','<h3>hit results</h3><div class="score-hit-content" aria-live="polite">loading hit results…</div>');mods.after(hits);
  for(const row of [...list.children])if(['mods','played'].includes(row.firstElementChild.textContent))row.remove();
  const more=designElement('details','score-more','<summary>score information <span>ids, weighting and scoring</span></summary>');list.before(more);more.append(list);
  actions.querySelectorAll('a,button').forEach(action=>{if(!action.classList.contains('action'))action.classList.add('quiet-action')});
  const client=score.client==='lazer'?'lazer':'stable';
  get('/api/v1/users/'+profileOwnerId+'/score?client='+client+'&id='+Number(score.id)).then(data=>{
    if(!hits.isConnected)return;const values=data.statistics||{},mode=Number(data.mode),stable='n300' in values;
    const labels=stable?(mode===3?[['ngeki','max'],['n300','300'],['nkatu','200'],['n100','100'],['n50','50'],['nmiss','miss']]:mode===2?[['n300','fruit'],['n100','droplets'],['n50','tiny droplets'],['nkatu','tiny misses'],['nmiss','miss']]:mode===1?[['n300','great'],['n100','ok'],['nmiss','miss']]:[['n300','300'],['n100','100'],['n50','50'],['nmiss','miss']]):[['perfect',mode===3?'max':'perfect'],['great',mode===2?'fruit':'great'],['good','good'],['ok','ok'],['meh','meh'],['miss','miss'],['large_tick_hit','large ticks'],['small_tick_hit','small ticks'],['small_tick_miss','small misses'],['large_tick_miss','large misses'],['slider_tail_hit','slider ends']].filter(([key])=>key in values);
    hits.querySelector('.score-hit-content').innerHTML=labels.length?'<div class="score-hit-grid">'+labels.map(([key,label])=>'<div class="score-hit '+(key.includes('miss')?'miss':'')+'"><span>'+label+'</span><strong>'+fmt(values[key]||0)+'</strong></div>').join('')+'</div>':'no hit results were stored for this play.';
  }).catch(()=>{if(hits.isConnected)hits.querySelector('.score-hit-content').textContent='hit results are unavailable for this play.'});
}

window.addEventListener('beforeunload',event=>{if(document.querySelector('.design-settings[data-dirty="true"]')){event.preventDefault();event.returnValue=''}});
