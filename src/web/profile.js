let activeProfileData=null;

function bindProfileAccess(p){
  const access=p.profile_access||{},view=document.querySelector('.profile-view'),head=view?.querySelector('.profile-head');
  if(!view||!head)return;
  if(p.restricted&&access.owner){
    const warning=document.createElement('aside');warning.className='profile-restriction';warning.setAttribute('role','status');
    warning.innerHTML='<div><strong>your account is restricted.</strong><p>your profile is hidden from other players, but you and staff can still view it. if you think this is a mistake, send an appeal explaining what happened. don\'t make another account to get around the restriction.</p></div><a class="quiet-action" href="/appeal">send an appeal →</a>';
    view.prepend(warning);
  }else if(p.restricted&&access.staff){
    const badge=document.createElement('span');badge.className='profile-restricted-badge';badge.textContent='restricted';head.querySelector('.profile-name')?.append(badge);
  }
  if(!access.staff)return;
  const tools=document.createElement('details');tools.className='profile-staff';tools.innerHTML='<summary>staff controls <span>account #'+p.id+'</span></summary><div class="profile-staff-body"></div>';head.after(tools);
  let loaded=false;
  tools.ontoggle=async()=>{if(!tools.open||loaded)return;loaded=true;await loadProfileStaff(tools.querySelector('.profile-staff-body'),p)};
}

async function profileStaffRequest(path,options={}){
  const headers={...(options.headers||{})};if(options.method&&options.method!=='GET')headers['x-csrf-token']=staffSession?.csrf||'';
  const response=await fetch(path,{...options,headers,cache:'no-store'}),data=await response.json().catch(()=>({}));
  if(!response.ok)throw new Error(data.error||'staff request failed');return data;
}

async function loadProfileStaff(panel,p){
  const access=p.profile_access||{};panel.innerHTML='<p class="muted">checking staff session…</p>';
  try{
    const response=await fetch('/api/v1/staff/session',{cache:'no-store'});
    if(!response.ok){
      panel.innerHTML='<p>sign into staff tools to use these controls.</p><form class="profile-staff-login"><label class="field"><span>username</span><input name="username" autocomplete="username" required></label><label class="field"><span>password</span><input name="password" type="password" autocomplete="current-password" required></label><button class="quiet-action">unlock controls</button><p class="form-error" role="alert"></p></form>';
      const form=panel.querySelector('form');form.elements.username.value=siteSession?.user?.name||'';
      form.onsubmit=async event=>{event.preventDefault();const button=form.querySelector('button');button.disabled=true;try{staffSession=await profileStaffRequest('/api/v1/staff/session',{method:'POST',headers:{'content-type':'application/x-www-form-urlencoded'},body:new URLSearchParams(new FormData(form))});await loadProfileStaff(panel,p)}catch(error){form.querySelector('.form-error').textContent=error.message;button.disabled=false}finally{form.elements.password.value=''}};return;
    }
    staffSession=await response.json();
    if(!staffCan.moderate(staffSession.user)){panel.innerHTML='<p>your role has map-ranking access, but cannot moderate accounts.</p><a class="quiet-action" href="/staff">open staff workspace →</a>';return;}
    const d=await profileStaffRequest('/api/v1/staff/moderation?user='+p.id),u=d.user;
    const canManage=u.id!==staffSession.user.id&&u.id!==3&&(!(u.privileges&((1<<11)|(1<<12)|(1<<13)|(1<<14)))||staffCan.develop(staffSession.user)),admin=staffCan.admin(staffSession.user);
    const actions=[['note','add staff note'],['kick','kick from game'],['silence','silence'],['unsilence','remove silence'],...(admin?[[u.restricted?'unrestrict':'restrict',u.restricted?'remove restriction':'restrict account'],['revoke_sessions','revoke all sessions'],['reset_avatar','reset avatar'],['reset_banner','reset banner']]:[])];
    panel.innerHTML='<div class="profile-staff-state"><span>'+ (u.restricted?'restricted':'account open')+'</span><span>'+(u.silence_end>Date.now()/1000?'silenced until '+esc(when(u.silence_end)):'not silenced')+'</span><a href="/staff">full staff workspace ↗</a></div>'+(canManage?`<form class="profile-moderation-form"><input type="hidden" name="user_id" value="${u.id}"><label class="field"><span>action</span><select name="action">${actions.map(([value,label])=>`<option value="${value}">${label}</option>`).join('')}</select></label><label class="field profile-silence-duration" hidden><span>silence duration</span><select name="duration"><option value="600">10 minutes</option><option value="3600">1 hour</option><option value="86400">1 day</option><option value="604800">1 week</option></select></label><label class="field profile-action-reason"><span>reason / staff note</span><textarea name="reason" minlength="3" maxlength="1000" required placeholder="why are you making this change?"></textarea></label><button class="quiet-action" type="submit">apply to ${esc(u.name)}</button><p class="form-error" role="alert"></p><p class="form-good" role="status"></p></form>`:'<p class="muted">this account is protected from changes by your role. self actions and changes to kai are blocked.</p>')+`<details class="profile-staff-history"><summary>moderation history · ${d.audit.length}</summary>${d.audit.map(a=>`<div class="profile-event"><span>${esc(a.action)} · ${esc(a.actor)}</span><time>${esc(when(a.created_at))}</time><p>${esc(a.detail)}</p></div>`).join('')||'<p>no moderation history.</p>'}</details>`;
    const form=panel.querySelector('form');if(form){form.elements.action.onchange=()=>{panel.querySelector('.profile-silence-duration').hidden=form.elements.action.value!=='silence'};form.onsubmit=async event=>{event.preventDefault();const action=form.elements.action.value,label=actions.find(x=>x[0]===action)[1],button=form.querySelector('button');if(action!=='note'&&!confirm(label+' for '+u.name+'?'))return;button.disabled=true;form.querySelector('.form-error').textContent='';try{await profileStaffRequest('/api/v1/staff/moderation',{method:'POST',headers:{'content-type':'application/x-www-form-urlencoded'},body:new URLSearchParams(new FormData(form))});await profile(String(p.id));const next=document.querySelector('.profile-staff');if(next)next.open=true}catch(error){form.querySelector('.form-error').textContent=error.message;button.disabled=false}}}
    if(canManage&&staffCan.develop(staffSession.user)){const roles=document.createElement('details');roles.className='profile-staff-history';roles.innerHTML='<summary>roles and premium</summary><div class="profile-roles-workspace"></div>';panel.append(roles);roles.ontoggle=async()=>{if(!roles.open||roles.dataset.loaded)return;try{const data=await profileStaffRequest('/api/v1/staff/roles?user='+p.id);renderStaffRoles(roles.querySelector('div'),data);roles.dataset.loaded='true'}catch(error){roles.querySelector('div').textContent=error.message}}}
  }catch(error){panel.innerHTML='<p class="form-error" role="alert">'+esc(error.message)+'</p>'}
}

function profileMonthChart(items,label){
  if(!items?.length)return '<p class="empty">no '+esc(label)+' history yet.</p>';
  const rows=items.slice(-24),max=Math.max(1,...rows.map(x=>Number(x.count)||0)),width=720/rows.length;
  return `<svg class="profile-month-chart" viewBox="0 0 720 130" role="img" aria-label="${esc(label)} by month">${rows.map((item,index)=>{const count=Math.max(0,Number(item.count)||0),height=count/max*94,date=String(item.start_date||'').slice(0,7);return `<rect x="${index*width+2}" y="${100-height}" width="${Math.max(1,width-4)}" height="${Math.max(1,height)}" tabindex="0"><title>${esc(date)} · ${fmt(count)} ${esc(label)}</title></rect>${index===0||index===rows.length-1?`<text x="${index===0?0:720}" y="123" text-anchor="${index===0?'start':'end'}">${esc(date)}</text>`:''}`}).join('')}</svg>`;
}

function profileCollectionRows(items,kind){
  if(kind==='activity')return items.map(item=>`<article class="profile-event"><a href="/beatmapsets/${Number(item.set_id)}">${esc(item.artist)} — ${esc(item.title)} [${esc(item.version)}]</a><time>${esc(when(item.submitted_at))}</time><p>${esc(item.client)} · <span class="${item.passed?'':'form-error'}">${item.passed?'passed':'failed'}</span></p></article>`).join('');
  if(kind==='most_played')return items.map(item=>`<article class="profile-most-played"><a href="/beatmapsets/${Number(item.set_id)}"><span><strong>${esc(item.artist)} — ${esc(item.title)}</strong><small>[${esc(item.version)}]</small></span></a><span>${fmt(item.count)} plays</span></article>`).join('');
  return mappedBeatmapRows(items);
}

async function loadProfileCollection(container,id,kind,append=false){
  const serial=Number(container.dataset.serial||0)+1;container.dataset.serial=String(serial);
  const offset=append?Number(container.dataset.offset||0):0;
  if(!append)container.innerHTML='<p class="muted">loading…</p>';
  const oldButton=container.querySelector('[data-collection-more]');if(oldButton)oldButton.disabled=true;
  try{
    const items=await get('/api/v1/users/'+id+'/collection?kind='+kind+'&offset='+offset+'&source='+(container.dataset.source||'all')+'&mode='+(container.dataset.mode||0));
    if(!container.isConnected||Number(container.dataset.serial)!==serial)return;
    if(!Array.isArray(items))throw new Error('could not load this section');
    if(!append)container.innerHTML='';else container.querySelector('.profile-collection-controls')?.remove();
    container.insertAdjacentHTML('beforeend',profileCollectionRows(items,kind)||(!append?'<p class="empty">nothing here yet.</p>':''));
    container.dataset.offset=String(offset+25);
    if(items.length===25&&offset<10000){const controls=document.createElement('div');controls.className='profile-collection-controls';controls.innerHTML='<button class="quiet-action" type="button" data-collection-more>show more</button><span role="status"></span>';container.append(controls);controls.querySelector('button').onclick=()=>loadProfileCollection(container,id,kind,true)}
    bindMappedSetPreviews();
  }catch(error){if(Number(container.dataset.serial)!==serial)return;if(oldButton){oldButton.disabled=false;container.querySelector('[role=status]').textContent=error.message}else container.innerHTML='<p class="form-error" role="alert">'+esc(error.message)+'</p><button class="quiet-action" type="button">try again</button>';const retry=container.querySelector('button');if(!append&&retry)retry.onclick=()=>loadProfileCollection(container,id,kind)}
}

async function bindProfileRelationship(p){
  if(!siteSession||p.id===siteSession.user.id||p.id===3||p.restricted)return;
  const head=document.querySelector('.profile-head-tools')||document.querySelector('.profile-head'),box=document.createElement('div');box.className='profile-social';head.append(box);
  const render=data=>{if(!data.can_change){box.remove();return}box.innerHTML=`<button class="quiet-action" type="button" data-relation="${data.following?'unfollow':'follow'}">${data.following?(data.mutual?'mutual friends':'following'):'follow'}</button><a class="quiet-action" href="/chat?dm=${p.id}">message</a><button class="quiet-action" type="button" data-relation="${data.blocked?'unblock':'block'}">${data.blocked?'unblock':'block'}</button><span class="form-error" role="alert"></span>`;box.querySelectorAll('[data-relation]').forEach(button=>button.onclick=async()=>{if(button.dataset.relation==='block'&&!confirm('block '+p.name+'?'))return;button.disabled=true;try{const updated=await accountRequest('/api/v1/users/'+p.id+'/relationship',{method:'POST',headers:{'content-type':'application/x-www-form-urlencoded'},body:new URLSearchParams({action:button.dataset.relation})});render(updated);const fresh=await get('/api/v1/users/'+p.id);const value=document.querySelector('.profile-engagement .stat:first-child .value');if(value)value.textContent=fmt(fresh.follower_count)}catch(error){box.querySelector('.form-error').textContent=error.message;button.disabled=false}})};
  try{render(await accountRequest('/api/v1/users/'+p.id+'/relationship'))}catch(error){box.textContent=error.message}
}

async function bindProfileExtras(p){
  const view=document.querySelector('.profile-view');if(!view||p.id===3)return;
  bindProfileRelationship(p);
  const source=cleanSource(p.selected_source),mode=cleanMode(p.selected_mode,source),info=modeInfo(mode,source),scope=(source==='all'?'combined':source==='scorev2'?'stable score v2':source)+' · '+info.namespace+' / '+info.ruleset;
  const holder=document.createElement('div');holder.className='profile-extra-sections';view.append(holder);
  try{
    const d=await get('/api/v1/users/'+p.id+'/details?source='+source+'&mode='+mode);if(!holder.isConnected)return;
    const stats=p.selected_stats&&d.metrics?{...p.selected_stats,...d.metrics}:null,lastVisit=d.last_visit?when(d.last_visit):'not recorded';
    const nameRow=view.querySelector('.profile-details')||view.querySelector('.profile-facts');if(nameRow){const last=document.createElement('span');last.className='profile-last-visit';last.textContent='last seen '+lastVisit;nameRow.append(last)}
    if(stats){const section=document.createElement('details');section.id='profile-more-stats';section.className='profile-detail-section';const hitsPerPlay=stats.plays?Math.round(stats.total_hits/stats.plays):0;section.innerHTML=`<summary>more stats <span>${esc(scope)}</span></summary><div class="profile-detail-grid">${[['country rank',stats.country_rank?'#'+fmt(stats.country_rank):'—'],['total score',fmt(stats.total_score)],['total hits',fmt(stats.total_hits)],['hits per play',fmt(hitsPerPlay)],['replays watched by others',fmt(stats.replay_views)],['maps played',fmt(d.metrics?.played_beatmap_count||0)]].map(([label,value])=>`<div><small>${label}</small><strong>${value}</strong></div>`).join('')}</div><div class="profile-grades" aria-label="score grades for the selected view">${[['SS+','grade_ssh'],['SS','grade_ss'],['S+','grade_sh'],['S','grade_s'],['A','grade_a']].map(([label,key])=>`<span><strong>${label}</strong><small>${fmt(stats[key]||0)}</small></span>`).join('')}</div><p class="profile-scope-note">${source==='all'?'Stable and lazer together. grades use the highest-pp passed play per ranked map.':'stats and grades for this score view.'}</p>`;const anchor=view.querySelector('.rank-history')||view.querySelector('.profile-engagement');anchor?.after(section)}
    holder.innerHTML=`${p.recent_scores_public?`<details class="profile-detail-section" id="profile-activity"><summary>recent activity <span>${esc(scope)}</span></summary><div data-profile-collection="activity"></div></details>`:''}${p.stats_public&&p.recent_scores_public?`<details class="profile-detail-section" id="profile-historical"><summary>play history <span>monthly activity</span></summary><h3>plays · ${esc(scope)}</h3>${profileMonthChart(d.monthly_playcounts,'plays')}<h3>replay views · ${esc(info.ruleset)}</h3>${profileMonthChart(d.replays_watched_counts,'replay views')}</details><details class="profile-detail-section" id="profile-most-played"><summary>most played <span>${fmt(d.metrics?.played_beatmap_count||0)} maps · ${esc(scope)}</span></summary><div data-profile-collection="most_played"></div></details>`:''}`;
    holder.querySelectorAll('[data-profile-collection]').forEach(container=>{container.dataset.source=source;container.dataset.mode=String(mode);const section=container.closest('details');section.ontoggle=()=>{if(section.open&&!section.dataset.loaded){section.dataset.loaded='true';loadProfileCollection(container,p.id,container.dataset.profileCollection)}}});
    let maps=document.getElementById('mapped-beatmaps');if(!maps){maps=document.createElement('section');maps.id='mapped-beatmaps';maps.className='section';document.getElementById('recent-plays')?.after(maps)}
    const categories=[['all','mapped maps',null],['ranked','ranked / approved',d.ranked_count],['loved','loved',d.loved_count],['pending','pending',d.pending_count],['nominated','qualified',d.nominated_count],['graveyard','graveyard',d.graveyard_count],['guest','guest',d.guest_count],['favourite','favourites',d.favourite_count]];
    maps.innerHTML='<div class="section-head"><h2>beatmaps</h2><span class="eyebrow">mapped and saved</span></div><div class="profile-map-tabs" role="group" aria-label="beatmap collections">'+categories.map(([value,label,count],index)=>`<button type="button" class="quiet-action" data-profile-map-kind="${value}" aria-pressed="${index===0}">${label}${count===null?'':' · '+fmt(count)}</button>`).join('')+'</div><div id="profile-map-collection"></div>';
    const mapBody=maps.querySelector('#profile-map-collection');maps.querySelectorAll('[data-profile-map-kind]').forEach(button=>button.onclick=()=>{maps.querySelectorAll('[data-profile-map-kind]').forEach(other=>other.setAttribute('aria-pressed',String(other===button)));stopMappedPreview();loadProfileCollection(mapBody,p.id,button.dataset.profileMapKind)});loadProfileCollection(mapBody,p.id,'all');
    const navigation=document.createElement('nav');navigation.className='profile-section-nav';navigation.setAttribute('aria-label','profile sections');const links=[['top-plays','top plays'],['first-places','first places'],['recent-plays','recents'],['mapped-beatmaps','beatmaps'],['achievements','medals'],['profile-activity','activity'],['profile-historical','history'],['profile-most-played','most played']];navigation.innerHTML=links.filter(([id])=>document.getElementById(id)).map(([id,label])=>`<a href="#${id}">${label}</a>`).join('');view.querySelector('.mode-bar')?.after(navigation);navigation.querySelectorAll('a').forEach(link=>link.onclick=()=>{const target=document.getElementById(link.hash.slice(1));if(target?.tagName==='DETAILS')target.open=true;else if(target?.classList.contains('collapsed'))setPlaySectionCollapsed(target,false)});
  }catch(error){holder.innerHTML='<p class="form-error" role="alert">profile details could not load: '+esc(error.message)+'</p>'}
}
