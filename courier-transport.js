(() => {
  let sequence=0;
  window.flexlyfCourierRequest=async(action,shipment,signal)=>{
    const endpoint=window.FLEXLYF_COURIER_CONFIG?.endpoint;
    if(!endpoint){
      if(!['localhost','127.0.0.1'].includes(location.hostname))throw Error('Instant rates are being connected. Please use the manual enquiry form below.');
      const response=await fetch('/api/courier/'+action,action==='quote'?{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(shipment),signal}:{signal});
      const data=await response.json();if(!response.ok)throw Error(data.error||'Rates are unavailable.');return data;
    }
    if(!/^https:\/\/script\.google\.com\/macros\/s\/[a-zA-Z0-9_-]+\/exec$/.test(endpoint))throw Error('Quote service configuration needs attention.');
    return new Promise((resolve,reject)=>{
      const callback='flexlyfCourier_'+Date.now()+'_'+(++sequence),script=document.createElement('script');
      const url=new URL(endpoint);url.searchParams.set('action',action);url.searchParams.set('callback',callback);
      // Do not send free text, commodity, company or contact details to this read-only endpoint.
      if(shipment)url.searchParams.set('shipment',JSON.stringify({direction:shipment.direction,country:shipment.country,readyDate:shipment.readyDate,handling:shipment.handling,packages:shipment.packages}));
      const cleanup=()=>{clearTimeout(timer);script.remove();delete window[callback];signal?.removeEventListener('abort',cancel);};
      const fail=error=>{cleanup();reject(error);};
      const cancel=()=>fail(new DOMException('Cancelled','AbortError'));
      const timer=setTimeout(()=>fail(Error('The rate service took too long. Please try again or request a manual quote.')),30000);
      window[callback]=data=>{cleanup();data.error?reject(Error(data.error)):resolve(data);};
      script.onerror=()=>fail(Error('Could not reach the rate service. Please try again.'));
      script.src=url.href;script.referrerPolicy='no-referrer';signal?.addEventListener('abort',cancel,{once:true});
      if(signal?.aborted){cancel();return;}document.head.append(script);
    });
  };
})();
