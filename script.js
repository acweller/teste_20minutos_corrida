document.addEventListener('DOMContentLoaded', function() {
    const formulario = document.querySelector('.formulario');
    const resultadoDiv = document.getElementById('resultado');
    const tabelaCorpo = document.getElementById('tabela-corpo');

    // Criar as 7 linhas fixas ao carregar a página
    criarLinhasIniciais();

    formulario.addEventListener('submit', function(e) {
        e.preventDefault();

        const batimentos = document.getElementById('batimentos').value;
        const paceMinutos = document.getElementById('pace-minutos').value;
        const paceSegundos = document.getElementById('pace-segundos').value;

        if (batimentos && paceMinutos !== '' && paceSegundos !== '') {
            preencherTabela(batimentos, paceMinutos, paceSegundos);
            resultadoDiv.classList.add('ativo');
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
    }

    function formatarPace(minutos, segundos) {
        const min = String(minutos).padStart(2, '0');
        const seg = String(segundos).padStart(2, '0');
        return `${min}:${seg}`;
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
