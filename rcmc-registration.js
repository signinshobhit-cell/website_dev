(()=>{
  const search=document.getElementById('rcmcSearch'),group=document.getElementById('rcmcGroup');
  if(!search)return;
  const cards=[...document.querySelectorAll('.rcmc-card')];
  function filter(){
    const words=search.value.trim().toLowerCase().split(/\s+/).filter(Boolean);let visible=0;
    for(const card of cards){card.hidden=!(words.every(word=>card.textContent.toLowerCase().includes(word))&&(group.value==='all'||card.dataset.group===group.value));if(!card.hidden)visible++;}
    document.getElementById('rcmcCount').textContent=`${visible} of ${cards.length} services`;
    document.getElementById('rcmcEmpty').hidden=visible!==0;
  }
  search.addEventListener('input',filter);group.addEventListener('change',filter);
  document.getElementById('rcmcReset').addEventListener('click',()=>{search.value='';group.value='all';filter();search.focus();});filter();
})();
