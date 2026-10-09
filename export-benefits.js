(()=>{
  const search=document.getElementById('benefitSearch');
  if(!search)return;
  const audience=document.getElementById('benefitAudience'),type=document.getElementById('benefitType');
  const cards=[...document.querySelectorAll('.benefit-card')];
  function filter(){
    const words=search.value.trim().toLowerCase().split(/\s+/).filter(Boolean);
    let visible=0;
    for(const card of cards){
      card.hidden=!(words.every(word=>card.textContent.toLowerCase().includes(word))&&(audience.value==='all'||card.dataset.audience.split(' ').includes(audience.value))&&(type.value==='all'||type.value===card.dataset.type));
      if(!card.hidden)visible++;
    }
    document.getElementById('benefitCount').textContent=`${visible} of ${cards.length} benefits and facilities`;
    document.getElementById('benefitEmpty').hidden=visible!==0;
  }
  search.addEventListener('input',filter);audience.addEventListener('change',filter);type.addEventListener('change',filter);
  document.getElementById('benefitReset').addEventListener('click',()=>{search.value='';audience.value='all';type.value='all';filter();search.focus();});
  filter();
})();
