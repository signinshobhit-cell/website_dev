(()=>{
  const search=document.getElementById('agreementSearch'),group=document.getElementById('agreementGroup');if(!search)return;
  const cards=[...document.querySelectorAll('.agreement-card')];
  function filter(){const query=search.value.trim().toLowerCase();let visible=0;for(const card of cards){card.hidden=!(card.textContent.toLowerCase().includes(query)&&(group.value==='all'||card.dataset.group===group.value));if(!card.hidden)visible++;}document.getElementById('agreementCount').textContent=`${visible} of ${cards.length} services`;document.getElementById('agreementEmpty').hidden=visible!==0;}
  search.addEventListener('input',filter);group.addEventListener('change',filter);filter();
})();
