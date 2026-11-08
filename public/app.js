(async function checkLicense() {
  let key = localStorage.getItem('pg_license_key');
  
  if (!key) {
    key = prompt("Please enter your software license key to activate Samarth PG:");
    if (!key) {
      document.body.innerHTML = '<h2 style="text-align:center; padding: 40px;">Activation Required</h2>';
      return;
    }
  }

  try {
    const res = await fetch(`/verify?key=${encodeURIComponent(key)}`);
    const data = await res.json();
    
    if (data.valid) {
      localStorage.setItem('pg_license_key', key);
      initApp();
    } else {
      localStorage.removeItem('pg_license_key');
      document.body.innerHTML = '<h2 style="text-align:center; padding: 40px; color: red;">License Expired or Invalid. Contact Developer.</h2>';
    }
  } catch (e) {
    document.body.innerHTML = '<h2 style="text-align:center; padding: 40px; color: red;">App locked. Please connect to the internet to verify your license.</h2>';
  }
})();

function initApp() {
  var KEY='samarth_pg_owner_v1';
  var DEF={pg:'Shri Samarth PG',tpl:'Hello {name} ji 🙏\n{pg} rent for {month} is ₹{due} pending. Please pay soon. Thank you!',tenants:[],pay:{}};
  var S;
  try{S=JSON.parse(localStorage.getItem(KEY))||null}catch(e){S=null}
  if(!S||!S.tenants)S=JSON.parse(JSON.stringify(DEF));
  function save(){try{localStorage.setItem(KEY,JSON.stringify(S))}catch(e){}}
  var $=function(i){return document.getElementById(i)};
  var MN=['January','February','March','April','May','June','July','August','September','October','November','December'];
  var now=new Date(),yr=now.getFullYear(),mo=now.getMonth(),tab='pending',editId=null,payId=null;
  function mk(){return yr+'-'+String(mo+1).padStart(2,'0')}
  function mname(){return MN[mo]+' '+yr}
  function inr(n){return '₹'+Number(n||0).toLocaleString('en-IN')}
  function esc(s){return String(s||'').replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
  function paid(t){return (S.pay[mk()]||{})[t.id]||0}
  function pend(t){return Math.max(0,t.rent-paid(t))}
  function phone(p){var d=String(p||'').replace(/\D/g,'').replace(/^0+/,'');return d.length===10?'91'+d:d}
  function msg(t){return S.tpl.replace(/\{name\}/g,t.name).replace(/\{month\}/g,mname()).replace(/\{due\}/g,pend(t)).replace(/\{rent\}/g,t.rent).replace(/\{pg\}/g,S.pg)}
  function wa(t){return 'https://wa.me/'+phone(t.phone)+'?text='+encodeURIComponent(msg(t))}
  function status(t){var p=paid(t);if(pend(t)===0)return ['c-d','Paid ✓'];if(p>0)return ['c-h','Due '+inr(pend(t))];return ['c-p','Due '+inr(pend(t))]}

  function render(){
    $('mlabel').textContent=mname();
    var T=S.tenants,tot=0,col=0,pe=0;
    T.forEach(function(t){tot+=t.rent;col+=Math.min(paid(t),t.rent);pe+=pend(t)});
    $('sum').innerHTML='<div><small>Total rent</small><b>'+inr(tot)+'</b></div><div><small>Received</small><b>'+inr(col)+'</b></div><div class="pe"><small>Due</small><b>'+inr(pe)+'</b></div>';
    var np=T.filter(function(t){return pend(t)>0}).length;
    $('tabs').innerHTML=[['pending','Due ('+np+')'],['paid','Paid ('+(T.length-np)+')'],['all','All ('+T.length+')']].map(function(x){return '<button data-t="'+x[0]+'" class="'+(tab===x[0]?'on':'')+'">'+x[1]+'</button>'}).join('');
    $('bar').innerHTML=np?'<button class="wa" id="remAll">📲 Remind all ('+np+')</button>':'';
    var L=T.filter(function(t){return tab==='all'||(tab==='pending'?pend(t)>0:pend(t)===0)});
    L.sort(function(a,b){return pend(b)-pend(a)||a.name.localeCompare(b.name)});
    if(!L.length){$('list').innerHTML='<div class="empty">'+(T.length?(tab==='pending'?'No rent due 🎉':'Nothing here'):'Add a tenant using “+ Tenant”')+'</div>';return}
    $('list').innerHTML=L.map(function(t){var s=status(t);
      return '<div class="t"><div class="r1"><div><div class="nm">'+esc(t.name)+'</div><div class="sub">Room '+esc(t.room||'–')+' · Rent '+inr(t.rent)+(paid(t)?' · Received '+inr(paid(t)):'')+'</div></div><span class="chip '+s[0]+'">'+s[1]+'</span></div><div class="act">'+
      (pend(t)>0?'<button class="wa" data-wa="'+t.id+'">WhatsApp</button>':'')+'<button class="p" data-pay="'+t.id+'">Mark paid</button><button data-ed="'+t.id+'">Edit</button></div></div>'}).join('');
  }

  $('prev').onclick=function(){mo--;if(mo<0){mo=11;yr--}render()};
  $('next').onclick=function(){mo++;if(mo>11){mo=0;yr++}render()};
  $('tabs').onclick=function(e){var t=e.target.dataset.t;if(t){tab=t;render()}};
  function tById(id){return S.tenants.filter(function(t){return t.id===id})[0]}
  $('list').onclick=function(e){
    var d=e.target.dataset;
    if(d.wa){var t=tById(d.wa);if(!phone(t.phone)){alert('Please add a phone number (Edit)');return}window.open(wa(t),'_blank','noopener')}
    if(d.pay){openPay(d.pay)}
    if(d.ed){openEdit(d.ed)}
  };
  $('bar').onclick=function(e){if(e.target.id==='remAll'){
    var P=S.tenants.filter(function(t){return pend(t)>0});
    $('allList').innerHTML=P.map(function(t){return '<div class="rem"><div><div class="nm">'+esc(t.name)+'</div><div class="sub">'+inr(pend(t))+'</div></div>'+(phone(t.phone)?'<a href="'+wa(t)+'" target="_blank" rel="noopener">Send</a>':'<span class="sub">no number</span>')+'</div>'}).join('');
    $('dAll').showModal()}};
  $('allList').onclick=function(e){if(e.target.tagName==='A'){e.target.classList.add('sent');e.target.textContent='Sent ✓'}};
  $('aClose').onclick=function(){$('dAll').close()};

  function openEdit(id){editId=id||null;var t=id?tById(id):{name:'',room:'',phone:'',rent:''};
    $('eT').textContent=id?'Edit tenant':'New tenant';$('eName').value=t.name;$('eRoom').value=t.room;$('ePhone').value=t.phone;$('eRent').value=t.rent;
    $('eDel').style.visibility=id?'visible':'hidden';$('dEdit').showModal()}
  $('add').onclick=function(){openEdit()};
  $('eCan').onclick=function(){$('dEdit').close()};
  $('eSave').onclick=function(){
    var n=$('eName').value.trim(),r=parseInt($('eRent').value,10);
    if(!n||!(r>0)){alert('Name and rent are required');return}
    var o={name:n,room:$('eRoom').value.trim(),phone:$('ePhone').value.trim(),rent:r};
    if(editId){Object.assign(tById(editId),o)}else{o.id='t'+Date.now().toString(36);S.tenants.push(o)}
    save();$('dEdit').close();render()};
  $('eDel').onclick=function(){if(confirm('Delete this tenant?')){S.tenants=S.tenants.filter(function(t){return t.id!==editId});save();$('dEdit').close();render()}};

  function openPay(id){payId=id;var t=tById(id);$('pT').textContent=t.name;
    $('pInfo').textContent=mname()+' · Rent '+inr(t.rent)+' · Received so far '+inr(paid(t));
    $('pAmt').value=paid(t)||t.rent;$('dPay').showModal()}
  function setPaid(v){var m=mk();S.pay[m]=S.pay[m]||{};S.pay[m][payId]=Math.max(0,v||0);save();$('dPay').close();render()}
  $('pCan').onclick=function(){$('dPay').close()};
  $('pFull').onclick=function(){setPaid(tById(payId).rent)};
  $('pSave').onclick=function(){setPaid(parseInt($('pAmt').value,10))};

  $('set').onclick=function(){$('sPg').value=S.pg;$('sTpl').value=S.tpl;$('dSet').showModal()};
  $('sCan').onclick=function(){$('dSet').close()};
  $('sSave').onclick=function(){S.pg=$('sPg').value.trim()||DEF.pg;S.tpl=$('sTpl').value.trim()||DEF.tpl;save();$('dSet').close();render()};
  $('sExp').onclick=function(){var j=JSON.stringify(S);
    if(navigator.clipboard){navigator.clipboard.writeText(j).then(function(){alert('Backup copied. Paste it somewhere safe (WhatsApp / Notes).')},function(){prompt('Copy this text:',j)})}else prompt('Copy this text:',j)};
  $('sImp').onclick=function(){var j=prompt('Paste backup text here:');if(!j)return;
    try{var o=JSON.parse(j);if(!o.tenants)throw 0;S=Object.assign(JSON.parse(JSON.stringify(DEF)),o);save();$('dSet').close();render()}catch(e){alert('Invalid backup')}};

  if('serviceWorker' in navigator){navigator.serviceWorker.register('/sw.js').catch(function(){})}
  var dp=null;window.addEventListener('beforeinstallprompt',function(e){e.preventDefault();dp=e;$('inst').hidden=false});
  $('inst').onclick=function(){if(dp){dp.prompt();dp=null;$('inst').hidden=true}};
  render();
}