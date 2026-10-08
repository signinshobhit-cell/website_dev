(() => {
  const form = document.getElementById('cargoQuoteForm');
  if (!form) return;
  const mode = form.elements.mode, load = form.elements.seaLoad;
  const packages = document.getElementById('cargoPackages');
  const status = document.getElementById('cargoStatus');
  const whatsapp=document.createElement('a');
  whatsapp.className='cargo-tool';whatsapp.textContent='Discuss on WhatsApp';
  whatsapp.target='_blank';whatsapp.rel='noopener noreferrer';whatsapp.hidden=true;
  const whatsappNote=document.createElement('p');whatsappNote.className='cargo-note';whatsappNote.hidden=true;
  whatsappNote.textContent='Opens a message with your request reference. Press Send in WhatsApp to contact our team. This does not confirm a Google Sheets submission.';
  status.after(whatsapp,whatsappNote);
  let startedAt = Date.now();
  let requestId = crypto.randomUUID();
  function addPackage() {
    if (packages.children.length >= 20) return;
    const row = document.createElement('div'); row.className = 'cargo-package';
    row.innerHTML = `<label>Pieces<input data-key="pieces" type="number" min="1" max="100000" step="1" value="1" required></label><label>Kg per piece<input data-key="weight" type="number" min="0.01" max="1000000" step="0.01" required></label><label>Length (cm)<input data-key="length" type="number" min="0.1" max="10000" step="0.1" required></label><label>Width (cm)<input data-key="width" type="number" min="0.1" max="10000" step="0.1" required></label><label>Height (cm)<input data-key="height" type="number" min="0.1" max="10000" step="0.1" required></label><button class="cargo-tool" type="button" aria-label="Remove package group">Remove</button>`;
    row.querySelector('button').addEventListener('click', () => { row.remove(); summary(); });
    packages.append(row); summary();
  }
  function packageData() {
    return [...packages.children].map(row => Object.fromEntries([...row.querySelectorAll('input')].map(input => [input.dataset.key, Number(input.value)])));
  }
  function summary() {
    const rows = packageData();
    const weight = rows.reduce((sum,p) => sum+p.pieces*p.weight,0);
    const volume = rows.reduce((sum,p) => sum+p.pieces*p.length*p.width*p.height/1000000,0);
    document.getElementById('cargoSummary').textContent = `${rows.reduce((sum,p)=>sum+p.pieces,0)} pieces · ${weight.toFixed(2)} kg gross · ${volume.toFixed(3)} m³ volume`;
    const inactive=mode.value==='sea' && load.value==='fcl';
    [...packages.querySelectorAll('button')].forEach(button=>button.disabled=inactive || rows.length===1);
    document.getElementById('cargoAddPackage').disabled = inactive || rows.length>=20;
  }
  function conditional() {
    const sea = mode.value === 'sea', fcl = sea && load.value==='fcl';
    for (const [id,visible] of [['cargoSeaFields',sea],['cargoFclFields',fcl],['cargoPackageFields',!fcl]]) {
      const group=document.getElementById(id); group.hidden=!visible;
      group.querySelectorAll('input,select,button').forEach(input=>input.disabled=!visible);
    }
    const door = /door/.test(form.elements.service.value);
    document.getElementById('cargoAddressFields').hidden=!door;
    const pickup=form.elements.pickupAddress,delivery=form.elements.deliveryAddress;
    pickup.required=['door-door','door-port'].includes(form.elements.service.value);
    delivery.required=['door-door','port-door'].includes(form.elements.service.value);
    pickup.disabled=!pickup.required;delivery.disabled=!delivery.required;
    summary();
  }
  form.addEventListener('change',conditional); packages.addEventListener('input',summary);
  document.getElementById('cargoAddPackage').addEventListener('click',addPackage);
  form.addEventListener('submit',event=>{
    event.preventDefault();
    if (!form.reportValidity()) return;
    const referenceText=`Hello Flexlyf, I would like to discuss cargo quote request ${requestId}. Please help me with the rate.`;
    whatsapp.href='https://wa.me/919220819906?text='+encodeURIComponent(referenceText);
    whatsapp.hidden=false;whatsappNote.hidden=false;
    const endpoint=String(window.CARGO_QUOTE_ENDPOINT||'');
    if (!/^https:\/\/script\.google\.com\/macros\/s\/[A-Za-z0-9_-]+\/exec$/.test(endpoint)) {
      status.hidden=false;status.className='cargo-status error';
      status.textContent='Online requests are being connected. Your details have not been saved to Google Sheets. You can discuss your enquiry on WhatsApp or call +91 92208 19906.';
      status.focus();return;
    }
    const data=Object.fromEntries(new FormData(form));
    data.packages=(data.mode==='sea'&&data.seaLoad==='fcl')?[]:packageData();
    data.requestId=requestId;data.startedAt=startedAt;
    // A normal cross-origin form POST avoids CORS and opaque-response false positives.
    // Google's confirmation page reports success only after saving the sheet row.
    const post=document.createElement('form');post.method='POST';post.action=endpoint;post.target='_blank';
    const payload=document.createElement('input');payload.type='hidden';payload.name='payload';payload.value=JSON.stringify(data);post.append(payload);document.body.append(post);post.submit();post.remove();
    status.hidden=false;status.className='cargo-status';
    status.textContent='Check the Google confirmation tab to verify that your request was saved. If no confirmation appears, retry or call our trade desk. Your details remain here.';
  });
  document.getElementById('cargoNewRequest').addEventListener('click',()=>{form.reset();requestId=crypto.randomUUID();startedAt=Date.now();packages.replaceChildren();addPackage();conditional();status.hidden=true;whatsapp.hidden=true;whatsappNote.hidden=true;whatsapp.removeAttribute('href');});
  addPackage();conditional();
})();
