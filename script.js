// ==================== CONSTANTES ====================
const STORAGE_KEYS = {
    HISTORICO: 'historicoTreino',
    TEMA: 'tema'
};

const ZONAS = {
    NOMES: ['Zona 1', 'Zona 2', 'Zona 3', 'Zona 4', 'Zona 5a', 'Zona 5b', 'Zona 5c'],
    BATIMENTOS_PERCENTUAIS: [-0.15, -0.10, -0.05, 0, 0.03, 0.06, 0.06],
    PACE_AJUSTES: [
        { percentual: 0.29, segundosExtra: 1 },
        { percentual: 0.14, segundosExtra: 0 },
        { percentual: 0.06, segundosExtra: 0 },
        { percentual: 0, segundosExtra: 0 },
        { percentual: -0.03, segundosExtra: 0 },
        { percentual: -0.10, segundosExtra: 0 },
        { percentual: -0.10, segundosExtra: -1 }
    ]
};

const VALIDACAO = {
    PACE_MAX: 59,
    PACE_MIN: 0
};

// ==================== CACHE DE ELEMENTOS DOM ====================
let elementos = {};

// ==================== INICIALIZAÇÃO ====================
document.addEventListener('DOMContentLoaded', function() {
    inicializarElementos();
    carregarTema();
    inicializarInterface();
    configurarEventos();
});

function inicializarElementos() {
    elementos = {
        formulario: document.querySelector('.formulario'),
        resultadoDiv: document.getElementById('resultado'),
        tabelaCorpo: document.getElementById('tabela-corpo'),
        infoRegistros: document.getElementById('info-registros'),
        batimentos: document.getElementById('batimentos'),
        paceMinutos: document.getElementById('pace-minutos'),
        paceSegundos: document.getElementById('pace-segundos'),
        modalHistorico: document.getElementById('modal-historico'),
        listaHistorico: document.getElementById('lista-historico')
    };
}

function inicializarInterface() {
    criarLinhasIniciais();
    atualizarContadorRegistros();
    carregarUltimoRegistro();
}

function configurarEventos() {
    elementos.formulario.addEventListener('submit', handleSubmit);
    configurarValidacaoInputs();
}

// ==================== HANDLERS DE EVENTOS ====================
function handleSubmit(e) {
    e.preventDefault();

    const dados = obterDadosFormulario();

    if (validarDados(dados)) {
        salvarDados(dados);
        preencherTabela(dados);
        elementos.resultadoDiv.classList.add('ativo');
        elementos.formulario.reset();
    }
}

function obterDadosFormulario() {
    return {
        batimentos: elementos.batimentos.value,
        paceMinutos: elementos.paceMinutos.value,
        paceSegundos: elementos.paceSegundos.value
    };
}

function validarDados(dados) {
    return dados.batimentos && 
           dados.paceMinutos !== '' && 
           dados.paceSegundos !== '';
}

// ==================== CRIAÇÃO DE INTERFACE ====================
function criarLinhasIniciais() {
    const fragment = document.createDocumentFragment();

    ZONAS.NOMES.forEach((nome, index) => {
        const linha = criarLinhaTabela(nome, index + 1);
        fragment.appendChild(linha);
    });

    elementos.tabelaCorpo.appendChild(fragment);
}

function criarLinhaTabela(nomeZona, numeroZona) {
    const linha = document.createElement('div');
    linha.className = 'tabela-linha';
    linha.setAttribute('data-zona', numeroZona);
    linha.innerHTML = `
        <div class="tabela-celula zona">${nomeZona}</div>
        <div class="tabela-celula batimentos">-</div>
        <div class="tabela-celula pace">-</div>
    `;
    return linha;
}

// ==================== CÁLCULOS ====================
function calcularBatimentosPorZona(bpmBase) {
    const bpmBaseNumero = parseInt(bpmBase);

    return ZONAS.BATIMENTOS_PERCENTUAIS.map((percentual, index) => {
        const valorCalculado = Math.round(bpmBaseNumero * (1 + percentual));
        return index === 6 ? valorCalculado + 1 : valorCalculado;
    });
}

function calcularPacesPorZona(paceMinutos, paceSegundos) {
    const paceBaseSegundos = converterPaceParaSegundos(paceMinutos, paceSegundos);

    return ZONAS.PACE_AJUSTES.map(ajuste => {
        const alteracao = Math.round(paceBaseSegundos * ajuste.percentual);
        const paceTotal = paceBaseSegundos + alteracao + ajuste.segundosExtra;
        return converterSegundosParaPace(paceTotal);
    });
}

function converterPaceParaSegundos(minutos, segundos) {
    return parseInt(minutos) * 60 + parseInt(segundos);
}

function converterSegundosParaPace(totalSegundos) {
    return {
        minutos: Math.floor(totalSegundos / 60),
        segundos: Math.round(totalSegundos % 60)
    };
}

function formatarPace(minutos, segundos) {
    return `${String(minutos).padStart(2, '0')}:${String(segundos).padStart(2, '0')}`;
}

// ==================== PREENCHIMENTO DE TABELA ====================
function preencherTabela(dados) {
    const batimentos = calcularBatimentosPorZona(dados.batimentos);
    const paces = calcularPacesPorZona(dados.paceMinutos, dados.paceSegundos);
    const linhas = elementos.tabelaCorpo.querySelectorAll('.tabela-linha');

    linhas.forEach((linha, index) => {
        atualizarLinhaTabela(linha, batimentos[index], paces[index]);
    });

    atualizarContadorRegistros();
}

function atualizarLinhaTabela(linha, batimento, pace) {
    const celulaBatimentos = linha.querySelector('.batimentos');
    const celulaPace = linha.querySelector('.pace');

    celulaBatimentos.textContent = `${batimento} bpm`;
    celulaPace.textContent = `${formatarPace(pace.minutos, pace.segundos)}/km`;
}

// ==================== ARMAZENAMENTO ====================
function salvarDados(dados) {
    try {
        const registro = criarRegistro(dados);
        const historico = carregarHistorico();

        historico.push(registro);
        salvarHistorico(historico);

        console.log('✅ Dados salvos com sucesso!', registro);
        mostrarMensagem('Registro salvo com sucesso!', 'sucesso');
    } catch (erro) {
        console.error('❌ Erro ao salvar dados:', erro);
        mostrarMensagem('Erro ao salvar registro!', 'erro');
    }
}

function criarRegistro(dados) {
    return {
        id: Date.now(),
        data: new Date().toISOString(),
        batimentos: parseInt(dados.batimentos),
        paceMinutos: parseInt(dados.paceMinutos),
        paceSegundos: parseInt(dados.paceSegundos)
    };
}

function carregarHistorico() {
    try {
        const dados = localStorage.getItem(STORAGE_KEYS.HISTORICO);
        return dados ? JSON.parse(dados) : [];
    } catch (erro) {
        console.error('❌ Erro ao carregar histórico:', erro);
        return [];
    }
}

function salvarHistorico(historico) {
    localStorage.setItem(STORAGE_KEYS.HISTORICO, JSON.stringify(historico));
}

function carregarUltimoRegistro() {
    const historico = carregarHistorico();

    if (historico.length > 0) {
        const ultimo = historico[historico.length - 1];
        preencherFormulario(ultimo);
        preencherTabela(ultimo);
        elementos.resultadoDiv.classList.add('ativo');
    }
}

function preencherFormulario(registro) {
    elementos.batimentos.value = registro.batimentos;
    elementos.paceMinutos.value = registro.paceMinutos;
    elementos.paceSegundos.value = registro.paceSegundos;
}

function atualizarContadorRegistros() {
    const historico = carregarHistorico();
    const total = historico.length;

    if (total > 0) {
        const ultimo = historico[total - 1];
        const dataFormatada = formatarDataHora(ultimo.data);

        elementos.infoRegistros.innerHTML = `
            📊 <strong>${total}</strong> registro${total > 1 ? 's' : ''} salvo${total > 1 ? 's' : ''}
            | Último: ${dataFormatada}
        `;
        elementos.infoRegistros.classList.add('ativo');
    } else {
        elementos.infoRegistros.classList.remove('ativo');
    }
}

// ==================== VALIDAÇÃO ====================
function configurarValidacaoInputs() {
    const inputsNumero = document.querySelectorAll('input[type="number"]');

    inputsNumero.forEach(input => {
        input.addEventListener('input', () => validarInput(input));
    });
}

function validarInput(input) {
    if (input.value < VALIDACAO.PACE_MIN) {
        input.value = VALIDACAO.PACE_MIN;
    }

    if (input.id === 'pace-minutos' || input.id === 'pace-segundos') {
        if (input.value > VALIDACAO.PACE_MAX) {
            input.value = VALIDACAO.PACE_MAX;
        }
    }
}

// ==================== FORMATAÇÃO ====================
function formatarDataHora(isoString) {
    return new Date(isoString).toLocaleString('pt-BR');
}

function formatarData(isoString) {
    return new Date(isoString).toLocaleDateString('pt-BR');
}

function formatarHora(isoString) {
    return new Date(isoString).toLocaleTimeString('pt-BR', { 
        hour: '2-digit', 
        minute: '2-digit' 
    });
}

// ==================== TEMA ====================
function carregarTema() {
    let temaSalvo = localStorage.getItem(STORAGE_KEYS.TEMA);

    if (!temaSalvo) {
        const preferenciaSistema = window.matchMedia('(prefers-color-scheme: dark)').matches;
        temaSalvo = preferenciaSistema ? 'dark' : 'light';
        localStorage.setItem(STORAGE_KEYS.TEMA, temaSalvo);
    }

    aplicarTema(temaSalvo);
}

function aplicarTema(tema) {
    if (tema === 'dark') {
        document.documentElement.setAttribute('data-theme', 'dark');
    } else {
        document.documentElement.removeAttribute('data-theme');
    }
}

function toggleTema() {
    const temaAtual = document.documentElement.getAttribute('data-theme');
    const novoTema = temaAtual === 'dark' ? 'light' : 'dark';

    aplicarTema(novoTema);
    localStorage.setItem(STORAGE_KEYS.TEMA, novoTema);

    const mensagem = novoTema === 'dark' ? 'Modo escuro ativado' : 'Modo claro ativado';
    mostrarMensagem(mensagem, 'info');
}

// ==================== MENSAGENS ====================
function mostrarMensagem(texto, tipo = 'info') {
    const mensagem = document.createElement('div');
    mensagem.className = `mensagem-flutuante ${tipo}`;
    mensagem.textContent = texto;
    mensagem.setAttribute('role', 'alert');
    mensagem.setAttribute('aria-live', 'polite');

    document.body.appendChild(mensagem);

    setTimeout(() => {
        mensagem.style.opacity = '0';
        setTimeout(() => mensagem.remove(), 300);
    }, 2000);
}

// ==================== EXPORTAÇÃO CSV ====================
function exportarCSV() {
    const historico = carregarHistorico();

    if (historico.length === 0) {
        mostrarMensagem('Nenhum registro para exportar!', 'erro');
        return;
    }

    try {
        const csv = gerarCSV(historico);
        baixarArquivo(csv, `treino_zonas_${obterDataAtual()}.csv`, 'text/csv');
        mostrarMensagem(
            `${historico.length} registro${historico.length > 1 ? 's' : ''} exportado${historico.length > 1 ? 's' : ''}!`,
            'sucesso'
        );
    } catch (erro) {
        console.error('❌ Erro ao exportar CSV:', erro);
        mostrarMensagem('Erro ao exportar arquivo!', 'erro');
    }
}

function gerarCSV(historico) {
    const cabecalho = 'Data,Hora,Batimentos (bpm),Pace (min:seg)\n';

    const linhas = historico.map(registro => {
        const data = formatarData(registro.data);
        const hora = formatarHora(registro.data);
        const pace = formatarPace(registro.paceMinutos, registro.paceSegundos);
        return `${data},${hora},${registro.batimentos},${pace}`;
    }).join('\n');

    return cabecalho + linhas;
}

function baixarArquivo(conteudo, nomeArquivo, tipoMime) {
    const blob = new Blob([conteudo], { type: `${tipoMime};charset=utf-8;` });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.href = url;
    link.download = nomeArquivo;
    link.click();

    window.URL.revokeObjectURL(url);
}

function obterDataAtual() {
    return new Date().toISOString().split('T')[0];
}

// ==================== HISTÓRICO ====================
function verHistorico() {
    const historico = carregarHistorico();

    if (historico.length === 0) {
        elementos.listaHistorico.innerHTML = criarMensagemVazia();
    } else {
        elementos.listaHistorico.innerHTML = gerarListaHistorico(historico);
    }

    elementos.modalHistorico.classList.add('ativo');
}

function criarMensagemVazia() {
    return '<div class="sem-registros">📭 Nenhum registro encontrado</div>';
}

function gerarListaHistorico(historico) {
    return [...historico]
        .reverse()
        .map((registro, index) => criarItemHistorico(registro, historico.length - index))
        .join('');
}

function criarItemHistorico(registro, numero) {
    const data = formatarData(registro.data);
    const hora = formatarHora(registro.data);
    const pace = formatarPace(registro.paceMinutos, registro.paceSegundos);

    return `
        <div class="item-historico" role="article">
            <div class="item-historico-data">
                🏃 Teste #${numero} - ${data} às ${hora}
            </div>
            <div class="item-historico-dados">
                💓 ${registro.batimentos} bpm | ⏱️ ${pace}/km
            </div>
        </div>
    `;
}

function fecharHistorico() {
    elementos.modalHistorico.classList.remove('ativo');
}

function limparHistorico() {
    const historico = carregarHistorico();

    if (historico.length === 0) {
        mostrarMensagem('Não há registros para apagar!', 'erro');
        return;
    }

    const mensagemConfirmacao = `⚠️ Tem certeza que deseja apagar ${historico.length} registro${historico.length > 1 ? 's' : ''}?\n\nEsta ação não pode ser desfeita!`;

    if (confirm(mensagemConfirmacao)) {
        try {
            localStorage.removeItem(STORAGE_KEYS.HISTORICO);
            elementos.infoRegistros.classList.remove('ativo');
            mostrarMensagem('Histórico apagado com sucesso!', 'sucesso');
            console.log('🗑️ Histórico limpo');
        } catch (erro) {
            console.error('❌ Erro ao limpar histórico:', erro);
            mostrarMensagem('Erro ao limpar histórico!', 'erro');
        }
    }
}

// ==================== EVENT LISTENERS GLOBAIS ====================
window.onclick = function(event) {
    if (event.target === elementos.modalHistorico) {
        fecharHistorico();
    }
};

// Adicionar suporte para tecla ESC fechar modal
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape' && elementos.modalHistorico.classList.contains('ativo')) {
        fecharHistorico();
    }
});
