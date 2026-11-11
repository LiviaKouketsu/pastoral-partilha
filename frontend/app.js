const LIMITE_ESTOQUE_BAIXO = 5;

let db = null;
const configOk = SUPABASE_URL && !SUPABASE_URL.includes("COLE_AQUI") &&
                 SUPABASE_ANON_KEY && !SUPABASE_ANON_KEY.includes("COLE_AQUI");
if (configOk) db = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const $ = (sel, el = document) => el.querySelector(sel);
const app = $("#app");

const fmtNum = (n) => {
  const x = Number(n);
  return Number.isInteger(x) ? String(x) : x.toFixed(2).replace(/\.?0+$/, "").replace(".", ",");
};
const embalagem = (v) => `${fmtNum(v.tamanho)} ${v.unidade}`;
const hojeISO = () => new Date().toISOString().slice(0, 10);
const esc = (s) => String(s ?? "").replace(/[&<>"]/g, c => ({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;" }[c]));

function showToast(msg, tipo = "success") {
  const cores = { success: "bg-success", error: "bg-error", info: "bg-secondary" };
  const t = document.createElement("div");
  t.className = `fixed bottom-6 left-1/2 -translate-x-1/2 z-50 text-white px-5 py-3 rounded-md shadow-lg font-medium ${cores[tipo]}`;
  t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 3000);
}

function card(inner, extra = "") {
  return `<div class="bg-surface border border-outline-light rounded-lg shadow-sm ${extra}">${inner}</div>`;
}
function pageHeader(titulo, sub = "") {
  return `<div class="mb-6">
    <h1 class="font-display font-bold text-2xl sm:text-3xl text-primary">${esc(titulo)}</h1>
    ${sub ? `<p class="text-on-surface-variant mt-1">${esc(sub)}</p>` : ""}
  </div>`;
}
function dataHoje() {
  return new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "long", year: "numeric" });
}

function seloCesta(nome) {
  const m = { P: "bg-accent-green", M: "bg-accent-blue", G: "bg-error" };
  return `<span class="inline-flex items-center justify-center w-7 h-7 rounded-full text-white text-sm font-bold ${m[nome] || "bg-primary"}">${esc(nome)}</span>`;
}

function openModal(titulo, bodyHtml, onReady) {
  const root = $("#modal-root");
  root.innerHTML = `
    <div class="fixed inset-0 bg-black/40 z-50 flex items-start sm:items-center justify-center p-4 overflow-y-auto">
      <div class="bg-surface rounded-lg shadow-xl w-full max-w-lg my-8">
        <div class="flex items-center justify-between px-6 py-4 border-b border-outline-light">
          <h2 class="font-display font-bold text-xl text-primary">${esc(titulo)}</h2>
          <button id="modal-x" class="text-on-surface-variant hover:text-primary"><span class="material-symbols-outlined">close</span></button>
        </div>
        <div class="p-6">${bodyHtml}</div>
      </div>
    </div>`;
  $("#modal-x").onclick = closeModal;
  if (onReady) onReady(root);
}
function closeModal() { $("#modal-root").innerHTML = ""; }

async function getVariacoes() {
  const { data, error } = await db
    .from("variacoes")
    .select("id,tamanho,unidade,quantidade_estoque,ativo, itens(id,nome,ativo,vai_na_cesta, categorias(id,nome))");
  if (error) throw error;
  return (data || [])
    .filter(v => v.ativo && v.itens && v.itens.ativo)
    .map(v => ({
      id: v.id, tamanho: v.tamanho, unidade: v.unidade, estoque: Number(v.quantidade_estoque),
      item: v.itens.nome, vai_na_cesta: v.itens.vai_na_cesta, categoria: v.itens.categorias?.nome || "—",
    }))
    .sort((a, b) => a.categoria.localeCompare(b.categoria) || a.item.localeCompare(b.item) || a.tamanho - b.tamanho);
}
const getCategorias = async () => (await db.from("categorias").select("*").order("nome")).data || [];
const getTiposCesta = async () => (await db.from("tipos_cesta").select("*").order("nome")).data || [];

async function pageInicio() {
  const [{ count: nFam }, esperadas, variacoes] = await Promise.all([
    db.from("familias").select("*", { count: "exact", head: true }).eq("ativo", true),
    db.from("v_cestas_esperadas").select("*"),
    getVariacoes(),
  ]);
  const esp = esperadas.data || [];
  const totalCestas = esp.reduce((s, e) => s + Number(e.esperadas), 0);
  const baixo = variacoes.filter(v => v.estoque < LIMITE_ESTOQUE_BAIXO);

  app.innerHTML = pageHeader("Início", dataHoje()) + `
    <div class="mb-6">
      <button id="btn-lista" class="bg-accent-orange text-white font-semibold px-6 h-14 rounded-md shadow hover:opacity-90 flex items-center gap-2">
        <span class="material-symbols-outlined">picture_as_pdf</span> Gerar lista de compras
      </button>
      <p class="text-on-surface-variant text-sm mt-2">PDF com o que falta comprar pras cestas do mês.</p>
    </div>
    <div class="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      ${card(`<div class="p-5">
        <div class="flex items-center gap-2 text-on-surface-variant"><span class="material-symbols-outlined text-primary">diversity_3</span> Famílias ativas</div>
        <div class="font-display font-bold text-4xl text-primary mt-2">${nFam || 0}</div>
      </div>`)}
      ${card(`<div class="p-5">
        <div class="flex items-center gap-2 text-on-surface-variant"><span class="material-symbols-outlined text-accent-green">shopping_basket</span> Cestas esperadas</div>
        <div class="font-display font-bold text-4xl text-primary mt-2">${totalCestas}</div>
        <div class="flex gap-2 mt-3">${esp.map(e => `<span class="flex items-center gap-1">${seloCesta(e.cesta)}<b>${e.esperadas}</b></span>`).join("")}</div>
      </div>`)}
      ${card(`<div class="p-5">
        <div class="flex items-center gap-2 text-on-surface-variant"><span class="material-symbols-outlined text-warning">warning</span> Itens com estoque baixo</div>
        <div class="font-display font-bold text-4xl text-primary mt-2">${baixo.length}</div>
        <div class="text-sm text-on-surface-variant mt-1">abaixo de ${LIMITE_ESTOQUE_BAIXO} em estoque</div>
      </div>`)}
    </div>

    <div class="grid gap-5 sm:grid-cols-2 mt-6">
      <a href="#recebimento" class="block">${card(`<div class="p-5 flex items-center gap-4 hover:bg-surface-variant/40 transition">
        <span class="material-symbols-outlined text-4xl text-accent-orange">input</span>
        <div><div class="font-display font-semibold text-lg text-primary">Contagem</div>
        <div class="text-on-surface-variant text-sm">Contar as doações que chegaram</div></div>
        <span class="material-symbols-outlined ml-auto text-on-surface-variant">arrow_forward</span></div>`)}</a>
      <a href="#montagem" class="block">${card(`<div class="p-5 flex items-center gap-4 hover:bg-surface-variant/40 transition">
        <span class="material-symbols-outlined text-4xl text-accent-green">shopping_basket</span>
        <div><div class="font-display font-semibold text-lg text-primary">Montagem de cestas</div>
        <div class="text-on-surface-variant text-sm">Marcar as cestas montadas no dia</div></div>
        <span class="material-symbols-outlined ml-auto text-on-surface-variant">arrow_forward</span></div>`)}</a>
    </div>

    ${baixo.length ? card(`<div class="p-5">
      <h3 class="font-display font-semibold text-lg text-primary mb-3">Precisam de reposição</h3>
      <div class="flex flex-wrap gap-2">
        ${baixo.map(v => `<span class="inline-flex items-center gap-1 bg-error-container text-on-error-container px-3 py-1 rounded-full text-sm">
          ${esc(v.item)} <span class="opacity-70">(${esc(embalagem(v))})</span> · ${fmtNum(v.estoque)}</span>`).join("")}
      </div></div>`, "mt-6") : ""}
  `;
  $("#btn-lista").onclick = gerarListaCompras;
}

async function pageRecebimento() {
  const variacoes = await getVariacoes();
  const porCat = agrupar(variacoes, v => v.categoria);

  app.innerHTML = pageHeader("Contagem de alimentos", "Digite o que chegou. Entra no estoque na hora.") + `
    <div class="flex flex-wrap items-end gap-4 mb-5">
      <label class="block">
        <span class="text-sm font-medium text-on-surface-variant">Dia da contagem</span>
        <input id="rec-data" type="date" value="${hojeISO()}" class="mt-1 block rounded-md border-outline h-12 px-3">
      </label>
      <a href="#itens" class="inline-flex items-center gap-1 text-secondary font-medium h-12">
        <span class="material-symbols-outlined">add</span> Cadastrar um item novo</a>
    </div>
    <div id="rec-grupos" class="space-y-5"></div>
    <div class="sticky bottom-0 bg-surface-ground pt-4 mt-6">
      <button id="rec-salvar" class="w-full sm:w-auto bg-accent-green text-white font-semibold px-8 h-14 rounded-md shadow hover:opacity-90 flex items-center justify-center gap-2">
        <span class="material-symbols-outlined">save</span> Salvar contagem</button>
    </div>`;

  $("#rec-grupos").innerHTML = Object.entries(porCat).map(([cat, itens]) => card(`
    <div class="p-5">
      <h3 class="font-display font-semibold text-lg text-primary mb-3">${esc(cat)}</h3>
      <div class="space-y-2">
        ${itens.map(v => `<div class="flex items-center gap-3 py-1">
          <div class="flex-1"><span class="font-medium">${esc(v.item)}</span>
            <span class="text-on-surface-variant text-sm">· ${esc(embalagem(v))}</span></div>
          <span class="text-sm text-on-surface-variant">tem ${fmtNum(v.estoque)}</span>
          <input type="number" min="0" step="1" inputmode="numeric" data-var="${v.id}"
            class="rec-input w-24 h-12 text-center rounded-md border-outline" placeholder="0">
        </div>`).join("")}
      </div>
    </div>`)).join("");

  $("#rec-salvar").onclick = async () => {
    const data = $("#rec-data").value || hojeISO();
    const linhas = [...document.querySelectorAll(".rec-input")]
      .map(i => ({ variacao_id: Number(i.dataset.var), quantidade: Number(i.value) }))
      .filter(l => l.quantidade > 0)
      .map(l => ({ ...l, data }));
    if (!linhas.length) return showToast("Digite ao menos uma quantidade.", "info");
    const { error } = await db.from("entradas").insert(linhas);
    if (error) return showToast("Erro ao salvar: " + error.message, "error");
    showToast(`Contagem salva! ${linhas.length} item(ns) no estoque.`);
    pageRecebimento();
  };
}

async function pageMontagem() {
  const data = (location.hash.split("?")[1] && new URLSearchParams(location.hash.split("?")[1]).get("d")) || hojeISO();
  const [tipos, esperadas, mont] = await Promise.all([
    getTiposCesta(),
    db.from("v_cestas_esperadas").select("*"),
    db.from("montagens").select("tipo_cesta_id,quantidade").eq("data", data),
  ]);
  const espMap = Object.fromEntries((esperadas.data || []).map(e => [e.tipo_cesta_id, Number(e.esperadas)]));
  const montMap = {};
  (mont.data || []).forEach(m => { montMap[m.tipo_cesta_id] = (montMap[m.tipo_cesta_id] || 0) + m.quantidade; });

  const coresCard = { P: "accent-green", M: "accent-blue", G: "error" };

  app.innerHTML = pageHeader("Montagem de cestas", "Marque as cestas montadas no dia.") + `
    <div class="mb-5">
      <label class="block w-fit">
        <span class="text-sm font-medium text-on-surface-variant">Dia da montagem</span>
        <input id="mt-data" type="date" value="${data}" class="mt-1 block rounded-md border-outline h-12 px-3">
      </label>
    </div>
    <div class="flex items-center gap-2 bg-warning-container text-on-warning-container px-4 py-3 rounded-md mb-5 text-sm">
      <span class="material-symbols-outlined">info</span>
      Ao confirmar, os ingredientes de cada cesta são descontados do estoque.
    </div>
    <div class="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      ${tipos.map(t => {
        const esp = espMap[t.id] || 0, feito = montMap[t.id] || 0;
        const pct = esp ? Math.min(100, Math.round(feito / esp * 100)) : (feito ? 100 : 0);
        const cor = coresCard[t.nome] || "primary";
        return card(`<div class="p-5">
          <div class="flex items-center gap-3">
            ${seloCesta(t.nome)}
            <div class="font-display font-semibold text-lg text-primary">Cesta ${esc(t.nome)}</div>
          </div>
          <div class="mt-4 flex items-end gap-2">
            <span class="font-display font-bold text-4xl text-${cor}">${feito}</span>
            <span class="text-on-surface-variant mb-1">/ ${esp} esperadas</span>
          </div>
          <div class="w-full h-2 bg-surface-variant rounded-full mt-2 overflow-hidden">
            <div class="h-full bg-${cor}" style="width:${pct}%"></div>
          </div>
          <div class="flex items-center gap-2 mt-4">
            <input type="number" min="1" step="1" value="1" data-tipo="${t.id}"
              class="mt-input w-20 h-12 text-center rounded-md border-outline">
            <button data-add="${t.id}" data-nome="${esc(t.nome)}"
              class="mt-add flex-1 bg-${cor} text-white font-semibold h-12 rounded-md hover:opacity-90 flex items-center justify-center gap-1">
              <span class="material-symbols-outlined">add</span> Confirmar</button>
          </div>
        </div>`);
      }).join("")}
    </div>`;

  $("#mt-data").onchange = (e) => { location.hash = `#montagem?d=${e.target.value}`; };

  document.querySelectorAll(".mt-add").forEach(btn => btn.onclick = async () => {
    const tipo = Number(btn.dataset.add);
    const input = document.querySelector(`.mt-input[data-tipo="${tipo}"]`);
    const qtd = Number(input.value);
    if (!qtd || qtd < 1) return showToast("Informe quantas cestas montou.", "info");
    const { error } = await db.from("montagens").insert({ data: $("#mt-data").value || hojeISO(), tipo_cesta_id: tipo, quantidade: qtd });
    if (error) return showToast("Erro: " + error.message, "error");
    showToast(`${qtd} cesta(s) ${btn.dataset.nome} registrada(s). Estoque atualizado.`);
    pageMontagem();
  });
}

async function pageEstoque() {
  const variacoes = await getVariacoes();
  app.innerHTML = pageHeader("Estoque") + `
    <div class="relative mb-5 max-w-md">
      <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">search</span>
      <input id="est-busca" type="text" placeholder="Buscar item…" class="w-full h-12 pl-11 pr-4 rounded-md border-outline">
    </div>
    <div id="est-lista"></div>`;

  const render = (filtro = "") => {
    const f = filtro.toLowerCase();
    const lista = variacoes.filter(v => v.item.toLowerCase().includes(f));
    const porCat = agrupar(lista, v => v.categoria);
    $("#est-lista").innerHTML = Object.entries(porCat).map(([cat, itens]) => card(`
      <div class="p-5">
        <h3 class="font-display font-semibold text-lg text-primary mb-3">${esc(cat)}</h3>
        <table class="w-full text-left">
          <thead><tr class="text-on-surface-variant text-sm border-b border-outline-light">
            <th class="py-2 font-medium">Item</th><th class="py-2 font-medium">Embalagem</th>
            <th class="py-2 font-medium text-right">Em estoque</th><th class="py-2"></th></tr></thead>
          <tbody>
          ${itens.map(v => {
            const baixo = v.estoque < LIMITE_ESTOQUE_BAIXO;
            return `<tr class="border-b border-outline-light/60">
              <td class="py-2.5 font-medium">${esc(v.item)}${v.vai_na_cesta ? "" : ` <span class="text-xs bg-surface-variant text-on-surface-variant px-2 py-0.5 rounded-full">só contabiliza</span>`}</td>
              <td class="py-2.5 text-on-surface-variant">${esc(embalagem(v))}</td>
              <td class="py-2.5 text-right font-semibold ${baixo ? "text-error" : ""}">${fmtNum(v.estoque)}</td>
              <td class="py-2.5 text-right">${baixo ? `<span class="text-xs bg-error-container text-on-error-container px-2 py-0.5 rounded-full">baixo</span>` : ""}</td>
            </tr>`;
          }).join("")}
          </tbody>
        </table>
      </div>`)).join("") || `<p class="text-on-surface-variant">Nenhum item encontrado.</p>`;
  };
  render();
  $("#est-busca").oninput = (e) => render(e.target.value);
}

async function pageFamilias() {
  const [{ data: familias }, tipos] = await Promise.all([
    db.from("familias").select("*, tipos_cesta(nome)").order("nome_responsavel"),
    getTiposCesta(),
  ]);

  app.innerHTML = pageHeader("Famílias acolhidas", `${(familias || []).filter(f => f.ativo).length} famílias ativas`) + `
    <div class="flex justify-end mb-4">
      <button id="fam-nova" class="bg-secondary text-white font-semibold px-5 h-12 rounded-md hover:opacity-90 flex items-center gap-2">
        <span class="material-symbols-outlined">add</span> Nova família</button>
    </div>
    ${card(`<div class="p-0 overflow-x-auto">
      <table class="w-full text-left min-w-[640px]">
        <thead><tr class="text-on-surface-variant text-sm border-b border-outline-light bg-surface-variant/30">
          <th class="py-3 px-5 font-medium">Responsável</th><th class="py-3 px-2 font-medium">Pessoas</th>
          <th class="py-3 px-2 font-medium">Cesta</th><th class="py-3 px-2 font-medium">Telefone</th>
          <th class="py-3 px-2 font-medium">Situação</th></tr></thead>
        <tbody>
        ${(familias || []).map(f => `<tr class="border-b border-outline-light/60">
          <td class="py-3 px-5 font-medium">${esc(f.nome_responsavel)}${f.observacoes ? `<div class="text-xs text-on-surface-variant">${esc(f.observacoes)}</div>` : ""}</td>
          <td class="py-3 px-2">${f.qtd_pessoas ?? "—"}</td>
          <td class="py-3 px-2">${f.tipos_cesta ? seloCesta(f.tipos_cesta.nome) : "—"}</td>
          <td class="py-3 px-2 text-on-surface-variant">${esc(f.telefone || "—")}</td>
          <td class="py-3 px-2">${f.ativo
            ? `<span class="text-xs bg-success-container text-on-success-container px-2 py-0.5 rounded-full">ativa</span>`
            : `<span class="text-xs bg-surface-variant text-on-surface-variant px-2 py-0.5 rounded-full">inativa</span>`}</td>
        </tr>`).join("") || `<tr><td colspan="5" class="py-6 px-5 text-on-surface-variant">Nenhuma família cadastrada ainda.</td></tr>`}
        </tbody>
      </table></div>`)}`;

  $("#fam-nova").onclick = () => {
    openModal("Nova família", `
      <form id="fam-form" class="space-y-4">
        <label class="block"><span class="text-sm font-medium">Nome do responsável *</span>
          <input name="nome_responsavel" required class="mt-1 w-full h-12 px-3 rounded-md border-outline"></label>
        <div class="grid grid-cols-2 gap-4">
          <label class="block"><span class="text-sm font-medium">Telefone</span>
            <input name="telefone" class="mt-1 w-full h-12 px-3 rounded-md border-outline"></label>
          <label class="block"><span class="text-sm font-medium">Nº de pessoas</span>
            <input name="qtd_pessoas" type="number" min="1" class="mt-1 w-full h-12 px-3 rounded-md border-outline"></label>
        </div>
        <label class="block"><span class="text-sm font-medium">Endereço</span>
          <input name="endereco" class="mt-1 w-full h-12 px-3 rounded-md border-outline"></label>
        <label class="block"><span class="text-sm font-medium">Tipo de cesta</span>
          <select name="tipo_cesta_id" class="mt-1 w-full h-12 px-3 rounded-md border-outline">
            <option value="">— selecione —</option>
            ${tipos.map(t => `<option value="${t.id}">${esc(t.nome)} — ${esc(t.descricao || "")}</option>`).join("")}
          </select></label>
        <label class="block"><span class="text-sm font-medium">Observações</span>
          <textarea name="observacoes" rows="2" class="mt-1 w-full px-3 py-2 rounded-md border-outline"></textarea></label>
        <div class="flex justify-end gap-2 pt-2">
          <button type="button" id="fam-cancel" class="px-4 h-12 rounded-md border border-outline">Cancelar</button>
          <button type="submit" class="px-5 h-12 rounded-md bg-secondary text-white font-semibold">Salvar</button>
        </div>
      </form>`, () => {
        $("#fam-cancel").onclick = closeModal;
        $("#fam-form").onsubmit = async (e) => {
          e.preventDefault();
          const fd = Object.fromEntries(new FormData(e.target));
          const reg = {
            nome_responsavel: fd.nome_responsavel.trim(),
            telefone: fd.telefone || null,
            endereco: fd.endereco || null,
            qtd_pessoas: fd.qtd_pessoas ? Number(fd.qtd_pessoas) : null,
            tipo_cesta_id: fd.tipo_cesta_id ? Number(fd.tipo_cesta_id) : null,
            observacoes: fd.observacoes || null,
          };
          const { error } = await db.from("familias").insert(reg);
          if (error) return showToast("Erro: " + error.message, "error");
          closeModal(); showToast("Família cadastrada!"); pageFamilias();
        };
      });
  };
}

async function pageItens() {
  const [categorias, { data: itens }] = await Promise.all([
    getCategorias(),
    db.from("itens").select("id,nome,vai_na_cesta,ativo, categorias(nome), variacoes(tamanho,unidade)").order("nome"),
  ]);

  app.innerHTML = pageHeader("Itens", "Cadastre novos tipos de alimento ou higiene.") + `
    <div class="grid gap-6 lg:grid-cols-2">
      ${card(`<div class="p-5">
        <h3 class="font-display font-semibold text-lg text-primary mb-4">Cadastrar novo item</h3>
        <form id="item-form" class="space-y-4">
          <label class="block"><span class="text-sm font-medium">Nome *</span>
            <input name="nome" required class="mt-1 w-full h-12 px-3 rounded-md border-outline" placeholder="Ex.: Gelatina"></label>
          <label class="block"><span class="text-sm font-medium">Categoria *</span>
            <select name="categoria_id" required class="mt-1 w-full h-12 px-3 rounded-md border-outline">
              ${categorias.map(c => `<option value="${c.id}">${esc(c.nome)}</option>`).join("")}
            </select></label>
          <div class="grid grid-cols-2 gap-4">
            <label class="block"><span class="text-sm font-medium">Tamanho *</span>
              <input name="tamanho" type="number" step="0.001" min="0" required class="mt-1 w-full h-12 px-3 rounded-md border-outline" placeholder="Ex.: 1"></label>
            <label class="block"><span class="text-sm font-medium">Unidade *</span>
              <input name="unidade" required class="mt-1 w-full h-12 px-3 rounded-md border-outline" placeholder="kg, g, L, ml, unidade" list="unidades">
              <datalist id="unidades"><option>kg</option><option>g</option><option>L</option><option>ml</option><option>unidade</option><option>lata</option><option>pacote</option></datalist></label>
          </div>
          <label class="flex items-center justify-between gap-3 bg-surface-variant/40 px-4 py-3 rounded-md cursor-pointer">
            <span><span class="font-medium">Vai na cesta?</span>
              <span class="block text-xs text-on-surface-variant">Desligue para itens que só contabilizam (ex.: gelatina).</span></span>
            <input name="vai_na_cesta" type="checkbox" checked class="w-6 h-6 rounded text-accent-green">
          </label>
          <button type="submit" class="w-full bg-accent-green text-white font-semibold h-12 rounded-md hover:opacity-90">Cadastrar item</button>
        </form>
      </div>`)}

      ${card(`<div class="p-5">
        <h3 class="font-display font-semibold text-lg text-primary mb-4">Itens cadastrados</h3>
        <div class="space-y-2 max-h-[520px] overflow-y-auto pr-1">
          ${(itens || []).map(i => `<div class="flex items-center gap-3 py-2 border-b border-outline-light/60">
            <div class="flex-1">
              <span class="font-medium">${esc(i.nome)}</span>
              <span class="text-xs text-on-surface-variant">· ${esc(i.categorias?.nome || "")}</span>
              <div class="text-xs text-on-surface-variant">${(i.variacoes || []).map(v => esc(fmtNum(v.tamanho) + " " + v.unidade)).join(" · ") || "sem tamanho"}</div>
            </div>
            ${i.vai_na_cesta
              ? `<span class="text-xs bg-success-container text-on-success-container px-2 py-0.5 rounded-full whitespace-nowrap">vai na cesta</span>`
              : `<span class="text-xs bg-surface-variant text-on-surface-variant px-2 py-0.5 rounded-full whitespace-nowrap">só contabiliza</span>`}
          </div>`).join("") || `<p class="text-on-surface-variant">Nenhum item ainda.</p>`}
        </div>
      </div>`)}
    </div>`;

  $("#item-form").onsubmit = async (e) => {
    e.preventDefault();
    const fd = Object.fromEntries(new FormData(e.target));
    const { data: novo, error } = await db.from("itens").insert({
      nome: fd.nome.trim(), categoria_id: Number(fd.categoria_id), vai_na_cesta: !!fd.vai_na_cesta,
    }).select().single();
    if (error) return showToast("Erro: " + error.message, "error");
    const { error: e2 } = await db.from("variacoes").insert({
      item_id: novo.id, tamanho: Number(fd.tamanho), unidade: fd.unidade.trim(),
    });
    if (e2) return showToast("Item criado, mas erro no tamanho: " + e2.message, "error");
    showToast("Item cadastrado!"); pageItens();
  };
}

function agrupar(arr, keyFn) {
  return arr.reduce((acc, x) => { const k = keyFn(x); (acc[k] = acc[k] || []).push(x); return acc; }, {});
}

async function gerarListaCompras() {
  if (!window.jspdf) return showToast("A biblioteca de PDF não carregou. Recarregue a página.", "error");
  const [esperadas, comp] = await Promise.all([
    db.from("v_cestas_esperadas").select("*"),
    db.from("cesta_itens").select("tipo_cesta_id, quantidade, variacoes(id, tamanho, unidade, quantidade_estoque, itens(nome, categorias(nome)))"),
  ]);
  if (comp.error) return showToast("Erro: " + comp.error.message, "error");
  const linhas = comp.data || [];
  if (!linhas.length) return showToast("Primeiro cadastre o que vai em cada cesta (tela Itens).", "info");

  const espMap = Object.fromEntries((esperadas.data || []).map(e => [e.tipo_cesta_id, Number(e.esperadas)]));

  const need = {};
  for (const row of linhas) {
    const v = row.variacoes;
    if (!v) continue;
    if (!need[v.id]) need[v.id] = {
      item: v.itens?.nome || "?", tamanho: v.tamanho, unidade: v.unidade,
      categoria: v.itens?.categorias?.nome || "Outros", precisa: 0, estoque: Number(v.quantidade_estoque),
    };
    need[v.id].precisa += (espMap[row.tipo_cesta_id] || 0) * Number(row.quantidade);
  }

  const faltam = Object.values(need)
    .map(n => ({ ...n, falta: Math.max(0, Math.ceil(n.precisa - n.estoque)) }))
    .filter(n => n.falta > 0)
    .sort((a, b) => a.categoria.localeCompare(b.categoria) || a.item.localeCompare(b.item));

  if (!faltam.length) return showToast("Tudo em estoque! Nada a comprar.", "success");

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  const mes = new Date().toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
  let y = 20;

  doc.setFont("helvetica", "bold"); doc.setFontSize(18); doc.setTextColor(19, 32, 74);
  doc.text("Lista de Compras", 14, y); y += 7;
  doc.setFont("helvetica", "normal"); doc.setFontSize(11); doc.setTextColor(74, 85, 104);
  doc.text(`Pastoral da Partilha - ${mes}`, 14, y); y += 10;

  let cat = "";
  for (const n of faltam) {
    if (y > 275) { doc.addPage(); y = 20; }
    if (n.categoria !== cat) {
      cat = n.categoria; y += 2;
      doc.setFont("helvetica", "bold"); doc.setFontSize(13); doc.setTextColor(19, 32, 74);
      doc.text(cat, 14, y); y += 7;
    }
    doc.setFont("helvetica", "normal"); doc.setFontSize(12); doc.setTextColor(26, 32, 44);
    doc.text(`( )   ${n.falta}x   ${n.item} - ${fmtNum(n.tamanho)} ${n.unidade}`, 18, y);
    y += 8;
  }

  doc.save(`lista-de-compras-${hojeISO()}.pdf`);
  showToast("Lista de compras gerada!");
}

const NAV = [
  { id: "inicio",      label: "Início",              icon: "home",            color: "" },
  { id: "recebimento", label: "Contagem",            icon: "input",           color: "text-accent-orange" },
  { id: "montagem",    label: "Montagem de cestas",  icon: "shopping_basket", color: "text-accent-green" },
  { id: "estoque",     label: "Estoque",             icon: "inventory_2",     color: "text-accent-blue" },
  { id: "familias",    label: "Famílias",            icon: "diversity_3",     color: "" },
  { id: "itens",       label: "Itens",               icon: "tune",            color: "" },
];
const ROTAS = {
  inicio: pageInicio, recebimento: pageRecebimento, montagem: pageMontagem,
  estoque: pageEstoque, familias: pageFamilias, itens: pageItens,
};

function renderNav(ativa) {
  $("#nav").innerHTML = NAV.map(n => `
    <a href="#${n.id}" class="nav-link flex items-center gap-3 px-3 py-3 rounded-md hover:bg-white/5 transition ${n.id === ativa ? "active" : ""}">
      <span class="material-symbols-outlined text-[26px] ${n.color}">${n.icon}</span>
      <span class="font-medium">${n.label}</span>
    </a>`).join("");
}

async function router() {
  if (!configOk) return telaSemConfig();
  const rota = (location.hash.replace("#", "").split("?")[0]) || "inicio";
  const fn = ROTAS[rota] || pageInicio;
  renderNav(ROTAS[rota] ? rota : "inicio");
  fecharMenuMobile();
  app.innerHTML = `<div class="text-on-surface-variant">Carregando…</div>`;
  try { await fn(); }
  catch (err) {
    app.innerHTML = pageHeader("Ops!") + card(`<div class="p-5">
      <p class="text-error font-medium">Não consegui falar com o banco de dados.</p>
      <p class="text-on-surface-variant mt-2 text-sm">Detalhe: ${esc(err.message || err)}</p>
      <p class="text-on-surface-variant mt-2 text-sm">Confira se você rodou os 4 arquivos SQL no Supabase e se a URL/chave no <b>config.js</b> estão certas.</p>
    </div>`);
  }
}

function telaSemConfig() {
  renderNav("inicio");
  app.innerHTML = pageHeader("Falta conectar ao banco") + card(`<div class="p-6 space-y-3">
    <p>Pra funcionar, o app precisa da URL e da chave do seu projeto no Supabase.</p>
    <ol class="list-decimal ml-5 space-y-1 text-on-surface-variant">
      <li>No Supabase, abra <b>Settings → API</b>.</li>
      <li>Copie a <b>Project URL</b> e a chave <b>anon public</b>.</li>
      <li>Cole no arquivo <b>config.js</b> e recarregue a página.</li>
    </ol>
  </div>`);
}

function abrirMenuMobile() { $("#sidebar").classList.remove("-translate-x-full"); $("#backdrop").classList.remove("hidden"); }
function fecharMenuMobile() { if (window.innerWidth < 1024) { $("#sidebar").classList.add("-translate-x-full"); $("#backdrop").classList.add("hidden"); } }
$("#btn-menu")?.addEventListener("click", abrirMenuMobile);
$("#backdrop")?.addEventListener("click", fecharMenuMobile);

window.addEventListener("hashchange", router);
window.addEventListener("DOMContentLoaded", router);
router();
