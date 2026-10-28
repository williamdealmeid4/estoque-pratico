const $ = (selector) => document.querySelector(selector);
const products = $('#products');
const select = $('#product-select');
const message = $('#message');
let items = [];
async function request(path, options = {}) {
  const response = await fetch(path, {headers:{'Content-Type':'application/json'},...options});
  const body = await response.json();
  if (!response.ok) throw new Error(body.error || 'Não foi possível concluir a operação.');
  return body;
}
function cell(row, text) { const td=document.createElement('td'); td.textContent=String(text); row.append(td); return td; }
function drawProducts() {
  const query=$('#search').value.trim().toLocaleLowerCase('pt-BR');
  const visible=items.filter(item => item.name.toLocaleLowerCase('pt-BR').includes(query));
  products.replaceChildren();
  for (const item of visible) {
    const row=document.createElement('tr'); cell(row,item.name); cell(row,item.quantity); cell(row,item.minimum);
    const status=cell(row,''); const badge=document.createElement('span');
    badge.className=item.quantity <= item.minimum ? 'status low' : 'status';
    badge.textContent=item.quantity <= item.minimum ? 'Repor' : 'Em dia'; status.append(badge); products.append(row);
  }
  $('#empty').hidden=visible.length>0;
}
async function refresh() {
  const [loaded, movements] = await Promise.all([request('/api/products'), request('/api/movements')]);
  items=loaded; $('#total').textContent=items.length; $('#low').textContent=items.filter(item=>item.quantity<=item.minimum).length;
  const selected=select.value; select.replaceChildren();
  for (const item of items) { const option=document.createElement('option'); option.value=item.id; option.textContent=item.name; select.append(option); }
  if (items.some(item=>String(item.id)===selected)) select.value=selected;
  $('#movement-form button').disabled=!items.length;
  drawProducts(); const history=$('#history'); history.replaceChildren();
  for (const move of movements) { const li=document.createElement('li'); const details=document.createElement('span'); details.textContent=`${move.kind === 'entrada' ? 'Entrada' : 'Saída'} de ${move.quantity} · ${move.name}${move.note ? ' — '+move.note : ''}`; const time=document.createElement('time'); time.dateTime=move.created_at; time.textContent=new Date(move.created_at).toLocaleString('pt-BR'); li.append(details,time); history.append(li); }
  $('#history-empty').hidden=movements.length>0;
}
$('#search').addEventListener('input',drawProducts);
$('#product-form').addEventListener('submit',async event=>{event.preventDefault(); const form=event.currentTarget; const data=new FormData(form); try { await request('/api/products',{method:'POST',body:JSON.stringify({name:data.get('name'),minimum:Number(data.get('minimum'))})}); form.reset(); await refresh(); message.textContent='Produto cadastrado.'; } catch(error) {message.textContent=error.message;} });
$('#movement-form').addEventListener('submit',async event=>{event.preventDefault(); const form=event.currentTarget; const data=new FormData(form); try { await request(`/api/products/${encodeURIComponent(data.get('product'))}/movements`,{method:'POST',body:JSON.stringify({kind:data.get('kind'),quantity:Number(data.get('quantity')),note:data.get('note')})}); form.reset(); await refresh(); message.textContent='Movimento registrado.'; } catch(error) {message.textContent=error.message;} });
refresh().catch(error=>{message.textContent=error.message;});