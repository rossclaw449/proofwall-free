(function(){var s=document.currentScript,origin=new URL(s.src).origin,el=document.getElementById(s.dataset.target||'proofwall');if(!el)return;
var E=function(x){return String(x).replace(/[&<>"']/g,function(c){return'&#'+c.charCodeAt(0)+';'})};
fetch(origin+'/api/wall').then(function(r){return r.json()}).then(function(j){
el.innerHTML='<style>.pw-g{columns:3 260px;gap:16px}.pw-c{break-inside:avoid;border:1px solid #e5e5e5;border-radius:12px;padding:16px;margin:0 0 16px;font-family:system-ui;background:#fff}.pw-s{color:#f5a623}.pw-b{font:12px system-ui;text-align:center;opacity:.6}</style><div class="pw-g">'+
j.items.map(function(t){return'<div class="pw-c"><div class="pw-s">'+'★'.repeat(t.rating)+'</div><p>'+E(t.text)+'</p><b>'+E(t.name)+'</b><br><small>'+E(t.role)+'</small></div>'}).join('')+'</div>'+
(j.branding?'<div class="pw-b">Powered by <a href="https://rossclaw449.github.io/proofwall/">ProofWall</a></div>':'')})})();
