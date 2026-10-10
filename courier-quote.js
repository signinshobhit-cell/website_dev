(() => {
  const form=document.getElementById('courierQuoteForm');if(!form)return;
  const direction=form.elements.direction,country=form.elements.country,rows=document.getElementById('courierPackages');
  const result=document.getElementById('courierResult'),submit=document.getElementById('courierCalculate');
  const fields=document.getElementById('courierDetails'),manual=document.getElementById('courierManual');
  let options=null,revision=0,abort;
  const status=text=>{result.replaceChildren();result.hidden=false;const p=document.createElement('p');p.textContent=text;result.append(p);};
  function clear(){revision++;abort?.abort();result.hidden=true;result.replaceChildren();submit.disabled=!options;submit.textContent='Show my rates';}
  function packages(){return [...rows.children].map(row=>Object.fromEntries([...row.querySelectorAll('input')].map(el=>[el.dataset.key,Number(el.value)])));}
  function add(){if(rows.children.length>=20)return;const row=document.createElement('div');row.className='cargo-package';
    row.innerHTML='<label>Pieces<input data-key="pieces" type="number" min="1" max="1000" step="1" value="1" required></label><label>Kg per piece<input data-key="weight" type="number" min="0.01" max="1000" step="0.01" required></label><label>Length (cm)<input data-key="length" type="number" min="0.1" max="1000" step="0.1" required></label><label>Width (cm)<input data-key="width" type="number" min="0.1" max="1000" step="0.1" required></label><label>Height (cm)<input data-key="height" type="number" min="0.1" max="1000" step="0.1" required></label><button type="button" class="cargo-tool" aria-label="Remove courier package group">Remove</button>';
    row.querySelector('button').addEventListener('click',()=>{row.remove();clear();removal();});rows.append(row);clear();removal();}
  function removal(){rows.querySelectorAll('button').forEach(b=>b.disabled=rows.children.length===1);document.getElementById('courierAddPackage').disabled=rows.children.length===20;}
  function countries(){country.replaceChildren(new Option('Choose a country',''));for(const c of options?.countries[direction.value]||[])country.add(new Option(c,c));}
  direction.addEventListener('change',()=>{clear();const sea=direction.value==='sea';fields.hidden=sea;manual.hidden=!sea;fields.querySelectorAll('input,select,button').forEach(el=>el.disabled=sea);submit.hidden=sea;countries();if(!sea)removal();});
  form.addEventListener('input',clear);form.addEventListener('change',clear);
  document.getElementById('courierSeaEnquiry').addEventListener('click',()=>{const cargo=document.getElementById('cargoQuoteForm');cargo.elements.mode.value='sea';cargo.dispatchEvent(new Event('change'));});
  document.getElementById('courierAddPackage').addEventListener('click',add);
  document.getElementById('courierReset').addEventListener('click',()=>{form.reset();rows.replaceChildren();add();direction.dispatchEvent(new Event('change'));});
  form.addEventListener('submit',async event=>{event.preventDefault();if(!form.reportValidity()||direction.value==='sea')return;
    clear();const version=revision;abort=new AbortController();submit.disabled=true;submit.textContent='Calculating…';status('Calculating your courier rates…');
    const input={direction:direction.value,country:country.value,readyDate:form.elements.readyDate.value,handling:form.elements.handling.value,packages:packages()};
    try {const response=await fetch('/api/courier/quote',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(input),signal:abort.signal});
      const data=await response.json();if(version!==revision)return;if(!response.ok)throw Error(data.error||'Could not calculate a rate.');result.replaceChildren();result.hidden=false;
      const title=document.createElement('h3');title.textContent=data.quotes.length?'Your courier estimates':'Let our team quote this shipment';result.append(title);
      if(data.shipment){const summary=document.createElement('p');summary.textContent=`${data.shipment.pieces} pieces · ${data.shipment.grossKg} kg actual · ${data.shipment.volumetricKg} kg volumetric · ${data.shipment.billableKg} kg estimated billable`;result.append(summary);}
      for(const [index,quote] of data.quotes.entries()){
        const card=document.createElement('article');card.className='courier-rate';
        const name=document.createElement('h4');name.textContent=quote.service;
        const price=document.createElement('strong');price.textContent=new Intl.NumberFormat('en-IN',{style:'currency',currency:'INR',maximumFractionDigits:2}).format(quote.amount);
        const note=document.createElement('p');note.textContent=`${quote.chargedKg} kg rate slab · ${index===0?'Lowest available estimate':'Courier service'}`;
        const link=document.createElement('a');link.className='cargo-tool';link.textContent='Confirm this rate on WhatsApp';link.target='_blank';link.rel='noopener noreferrer';
        link.href='https://wa.me/919220819906?text='+encodeURIComponent(`Hello Flexlyf, please confirm courier estimate ${data.reference}: ${quote.service}, ${price.textContent}, ${input.direction==='export'?'India to '+input.country:input.country+' to India'}, ready ${input.readyDate}. Commodity: ${form.elements.commodity.value}. Packages: ${JSON.stringify(input.packages)}. Taxes and duties excluded. Please check postcode serviceability.`);
        card.append(name,price,note,link);result.append(card);
      }
      const note=document.createElement('p');note.className='cargo-note';note.textContent=data.message;result.append(note);
      const enquiry=document.createElement('a');enquiry.href='#cargo-quote';enquiry.textContent='Send shipment details for confirmation';enquiry.className='cargo-tool';enquiry.addEventListener('click',()=>{
        const cargo=document.getElementById('cargoQuoteForm');cargo.elements.mode.value=direction.value==='sea'?'sea':'air';cargo.elements.service.value='door-door';cargo.elements.commodity.value=form.elements.commodity.value;
        cargo.elements.readyDate.value=input.readyDate;cargo.elements.origin.value=input.direction==='export'?'India':input.country;cargo.elements.destination.value=input.direction==='export'?input.country:'India';
        cargo.elements.notes.value=`Courier estimate ${data.reference||'manual enquiry'}. Cargo type: ${input.handling}. Package details: ${JSON.stringify(input.packages)}. ${cargo.elements.notes.value}`.slice(0,2000);
        const cargoRows=document.getElementById('cargoPackages');
        cargo.dispatchEvent(new Event('change'));
        while(cargoRows.children.length<input.packages.length)document.getElementById('cargoAddPackage').click();
        while(cargoRows.children.length>input.packages.length)cargoRows.lastElementChild.querySelector('button').click();
        [...cargoRows.children].forEach((row,i)=>row.querySelectorAll('input').forEach(el=>el.value=input.packages[i][el.dataset.key]));
        cargo.dispatchEvent(new Event('change'));});result.append(enquiry);result.focus();
    }catch(error){if(error.name!=='AbortError'&&version===revision)status(error.message==='Failed to fetch'?'Rates could not be loaded. Please retry or use the manual enquiry form.':error.message);}
    finally{if(version===revision){submit.disabled=false;submit.textContent='Show my rates';}}
  });
  add();submit.disabled=true;
  if(!['localhost','127.0.0.1'].includes(location.hostname)) {status('Instant courier estimates are being connected. Please use the manual enquiry form below.');return;}
  fetch('/api/courier/options').then(async response=>{if(!response.ok)throw Error();return response.json();}).then(data=>{options=data;countries();submit.disabled=false;result.hidden=true;}).catch(()=>status('Instant rates are unavailable on this preview. Please use the manual enquiry form below.'));
})();
