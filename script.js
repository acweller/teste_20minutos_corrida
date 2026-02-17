document.addEventListener('DOMContentLoaded', function() {

    // Carrega o tema salvo (claro ou escuro)
    carregarTema();

    const formulario = document.querySelector('.formulario');
    const resultadoDiv = document.getElementById('resultado');
    const tabelaCorpo = document.getElementById('tabela-corpo');
    const infoRegistros = document.getElementById('info-registros');

    // Criar as 7 linhas fixas ao carregar a página
    criarLinhasIniciais();

    // Atualizar contador de registros
    atualizarContadorRegistros();

    // Carregar último registro (opcional)
    carregarUltimoRegistro();

    formulario.addEventListener('submit', function(e) {
        e.preventDefault();

        const batimentos = document.getElementById('batimentos').value;
        const paceMinutos = document.getElementById('pace-minutos').value;
        const paceSegundos = document.getElementById('pace-segundos').value;

        if (batimentos && paceMinutos !== '' && paceSegundos !== '') {
            // SALVAR DADOS NO LOCALSTORAGE
            salvarDados(batimentos, paceMinutos, paceSegundos);

            // Preencher tabela com os dados calculados
            preencherTabela(batimentos, paceMinutos, paceSegundos);
            resultadoDiv.classList.add('ativo');

            // Limpar formulário após registro (opcional)
            formulario.reset();
        }
    });

    function criarLinhasIniciais() {
        const nomesZonas = ['Zona 1', 'Zona 2', 'Zona 3', 'Zona 4', 'Zona 5a', 'Zona 5b', 'Zona 5c'];

        for (let i = 0; i < 7; i++) {
            const linha = document.createElement('div');
            linha.className = 'tabela-linha';
            linha.setAttribute('data-zona', i + 1);

            linha.innerHTML = `
                <div class="tabela-celula zona">${nomesZonas[i]}</div>
                <div class="tabela-celula batimentos">-</div>
                <div class="tabela-celula pace">-</div>
            `;

            tabelaCorpo.appendChild(linha);
        }
    }

    function calcularBatimentosPorZona(bpmBase) {
        const batimentosPorZona = [];
        const bpmBaseNumero = parseInt(bpmBase);

        // Percentuais específicos para cada zona em relação a Z4
        const percentuais = [
            -0.15,  // Zona 1: -15%
            -0.10,  // Zona 2: -10%
            -0.05,  // Zona 3: -5%
            0,      // Zona 4: 0% (valor base)
            0.03,   // Zona 5a: +3%
            0.06,   // Zona 5b: +6%
            0.06    // Zona 5c: +6% + 1 bpm
        ];

        for (let i = 0; i < 7; i++) {
            let bpmZona;

            if (i === 6) {
                // Zona 5c: +6% + 1 batimento
                bpmZona = Math.round(bpmBaseNumero * (1 + percentuais[i])) + 1;
            } else {
                bpmZona = Math.round(bpmBaseNumero * (1 + percentuais[i]));
            }

            batimentosPorZona.push(bpmZona);
        }

        return batimentosPorZona;
    }

    function converterPaceParaSegundos(minutos, segundos) {
        return parseInt(minutos) * 60 + parseInt(segundos);
    }

    function converterSegundosParaPace(totalSegundos) {
        const min = Math.floor(totalSegundos / 60);
        const seg = Math.round(totalSegundos % 60);
        return { minutos: min, segundos: seg };
    }

    function calcularPacesPorZona(paceMinutos, paceSegundos) {
        const pacesPorZona = [];
        const paceBaseSegundos = converterPaceParaSegundos(paceMinutos, paceSegundos);

        // Percentuais específicos para cada zona em relação a Z4
        // Pace mais lento = mais segundos (positivo)
        // Pace mais rápido = menos segundos (negativo)
        const ajustesPorZona = [
            { percentual: 0.29, segundosExtra: 1 },   // Zona 1: +29% +1seg (mais lento)
            { percentual: 0.14, segundosExtra: 0 },   // Zona 2: +14% (mais lento)
            { percentual: 0.06, segundosExtra: 0 },   // Zona 3: +6% (mais lento)
            { percentual: 0, segundosExtra: 0 },      // Zona 4: valor base
            { percentual: -0.03, segundosExtra: 0 },  // Zona 5a: -3% (mais rápido)
            { percentual: -0.10, segundosExtra: 0 },  // Zona 5b: -10% (mais rápido)
            { percentual: -0.10, segundosExtra: -1 }  // Zona 5c: -10% -1seg (mais rápido)
        ];

        for (let i = 0; i < 7; i++) {
            const ajuste = ajustesPorZona[i];
            const alteracaoSegundos = Math.round(paceBaseSegundos * ajuste.percentual);
            const paceZonaSegundos = paceBaseSegundos + alteracaoSegundos + ajuste.segundosExtra;

            pacesPorZona.push(converterSegundosParaPace(paceZonaSegundos));
        }

        return pacesPorZona;
    }

    function preencherTabela(bpm, min, seg) {
        const batimentosPorZona = calcularBatimentosPorZona(bpm);
        const pacesPorZona = calcularPacesPorZona(min, seg);
        const linhas = tabelaCorpo.querySelectorAll('.tabela-linha');

        linhas.forEach((linha, index) => {
            const celulaBatimentos = linha.querySelector('.batimentos');
            const celulaPace = linha.querySelector('.pace');

            celulaBatimentos.textContent = `${batimentosPorZona[index]} bpm`;

            const pace = pacesPorZona[index];
            const paceFormatado = formatarPace(pace.minutos, pace.segundos);
            celulaPace.textContent = `${paceFormatado}/km`;
        });

        // ATUALIZAR CONTADOR
        atualizarContadorRegistros();
    }

    function formatarPace(minutos, segundos) {
        const min = String(minutos).padStart(2, '0');
        const seg = String(segundos).padStart(2, '0');
        return `${min}:${seg}`;
    }

    // ==================== FUNÇÕES DE ARMAZENAMENTO ====================

    function salvarDados(bpm, min, seg) {
        const registro = {
            id: Date.now(),
            data: new Date().toISOString(),
            batimentos: parseInt(bpm),
            paceMinutos: parseInt(min),
            paceSegundos: parseInt(seg)
        };

        let historico = JSON.parse(localStorage.getItem('historicoTreino')) || [];
        historico.push(registro);
        localStorage.setItem('historicoTreino', JSON.stringify(historico));

        console.log('✅ Dados salvos com sucesso!', registro);

        // Feedback visual
        mostrarMensagem('Registro salvo com sucesso!', 'sucesso');
    }

    function carregarHistorico() {
        return JSON.parse(localStorage.getItem('historicoTreino')) || [];
    }

    function carregarUltimoRegistro() {
        const historico = carregarHistorico();
        if (historico.length > 0) {
            const ultimo = historico[historico.length - 1];
            document.getElementById('batimentos').value = ultimo.batimentos;
            document.getElementById('pace-minutos').value = ultimo.paceMinutos;
            document.getElementById('pace-segundos').value = ultimo.paceSegundos;

            // Preencher tabela automaticamente
            preencherTabela(ultimo.batimentos, ultimo.paceMinutos, ultimo.paceSegundos);
            resultadoDiv.classList.add('ativo');
        }
    }

    function atualizarContadorRegistros() {
        const historico = carregarHistorico();
        const total = historico.length;

        if (total > 0) {
            const ultimo = historico[total - 1];
            const dataUltimo = new Date(ultimo.data).toLocaleString('pt-BR');

            infoRegistros.innerHTML = `
                📊 <strong>${total}</strong> registro${total > 1 ? 's' : ''} salvo${total > 1 ? 's' : ''} 
                | Último: ${dataUltimo}
            `;
            infoRegistros.classList.add('ativo');
        } else {
            infoRegistros.classList.remove('ativo');
        }
    }

    const inputsNumero = document.querySelectorAll('input[type="number"]');
    inputsNumero.forEach(input => {
        input.addEventListener('input', function() {
            if (this.value < 0) {
                this.value = 0;
            }

            if (this.id === 'pace-minutos' || this.id === 'pace-segundos') {
                if (this.value > 59) {
                    this.value = 59;
                }
            }
        });
    });
});

// ==================== FUNÇÃO DE TOGGLE DE TEMA ====================

function carregarTema() {
    let temaSalvo = localStorage.getItem('tema');

    // Se não houver tema salvo, detecta a preferência do sistema
    if (!temaSalvo) {
        const preferenciaSistema = window.matchMedia('(prefers-color-scheme: dark)').matches;
        temaSalvo = preferenciaSistema ? 'dark' : 'light';
        // Salva a preferência detectada
        localStorage.setItem('tema', temaSalvo);
    }

    // Aplica o tema
    if (temaSalvo === 'dark') {
        document.documentElement.setAttribute('data-theme', 'dark');
    } else {
        document.documentElement.removeAttribute('data-theme');
    }
}

function toggleTema() {
    const temaAtual = document.documentElement.getAttribute('data-theme');
    const novoTema = temaAtual === 'dark' ? 'light' : 'dark';

    document.documentElement.setAttribute('data-theme', novoTema);
    localStorage.setItem('tema', novoTema);

    // Feedback visual
    const mensagem = novoTema === 'dark' ? 'Modo escuro ativado' : 'Modo claro ativado';
    mostrarMensagem(mensagem, 'info');
}

function mostrarMensagem(texto, tipo) {
    const mensagem = document.createElement('div');
    mensagem.className = `mensagem-flutuante ${tipo}`;
    mensagem.textContent = texto;
    document.body.appendChild(mensagem);

    setTimeout(() => {
        mensagem.style.opacity = '0';
        setTimeout(() => mensagem.remove(), 300);
    }, 2000);
}


// ==================== FUNÇÕES GLOBAIS ====================

function exportarCSV() {
    const historico = JSON.parse(localStorage.getItem('historicoTreino')) || [];

    if (historico.length === 0) {
        alert('❌ Nenhum registro para exportar. Registre um teste primeiro!');
        return;
    }

    // Criar cabeçalho CSV
    let csv = 'Data,Hora,Batimentos (bpm),Pace (min:seg)\n';

    // Adicionar dados
    historico.forEach(registro => {
        const dataHora = new Date(registro.data);
        const data = dataHora.toLocaleDateString('pt-BR');
        const hora = dataHora.toLocaleTimeString('pt-BR');
        const pace = `${String(registro.paceMinutos).padStart(2, '0')}:${String(registro.paceSegundos).padStart(2, '0')}`;

        csv += `${data},${hora},${registro.batimentos},${pace}\n`;
    });

    // Criar e baixar arquivo
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `treino_zonas_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    alert(`✅ ${historico.length} registro${historico.length > 1 ? 's' : ''} exportado${historico.length > 1 ? 's' : ''} com sucesso!`);
}

function verHistorico() {
    const historico = JSON.parse(localStorage.getItem('historicoTreino')) || [];
    const modal = document.getElementById('modal-historico');
    const listaHistorico = document.getElementById('lista-historico');

    if (historico.length === 0) {
        listaHistorico.innerHTML = '<div class="sem-registros">📭 Nenhum registro encontrado</div>';
    } else {
        // Ordenar do mais recente para o mais antigo
        const historicoOrdenado = [...historico].reverse();

        listaHistorico.innerHTML = historicoOrdenado.map((registro, index) => {
            const dataHora = new Date(registro.data);
            const dataFormatada = dataHora.toLocaleDateString('pt-BR');
            const horaFormatada = dataHora.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
            const pace = `${String(registro.paceMinutos).padStart(2, '0')}:${String(registro.paceSegundos).padStart(2, '0')}`;

            return `
                <div class="item-historico">
                    <div class="item-historico-data">
                        🏃 Teste #${historico.length - index} - ${dataFormatada} às ${horaFormatada}
                    </div>
                    <div class="item-historico-dados">
                        💓 ${registro.batimentos} bpm | ⏱️ ${pace}/km
                    </div>
                </div>
            `;
        }).join('');
    }

    modal.classList.add('ativo');
}

function fecharHistorico() {
    const modal = document.getElementById('modal-historico');
    modal.classList.remove('ativo');
}

function limparHistorico() {
    const historico = JSON.parse(localStorage.getItem('historicoTreino')) || [];

    if (historico.length === 0) {
        alert('❌ Não há registros para apagar!');
        return;
    }

    if (confirm(`⚠️ Tem certeza que deseja apagar ${historico.length} registro${historico.length > 1 ? 's' : ''}?\n\nEsta ação não pode ser desfeita!`)) {
        localStorage.removeItem('historicoTreino');

        // Atualizar interface
        document.getElementById('info-registros').classList.remove('ativo');

        alert('✅ Histórico apagado com sucesso!');

        console.log('🗑️ Histórico limpo');
    }
}

// Fechar modal ao clicar fora dele
window.onclick = function(event) {
    const modal = document.getElementById('modal-historico');
    if (event.target === modal) {
        fecharHistorico();
    }
}
