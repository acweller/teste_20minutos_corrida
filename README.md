# Calculadora de Zonas de Treino - Teste de 20 Minutos

## 📋 Descrição

Este é um programa web desenvolvido para calcular automaticamente as zonas de treinamento de corrida com base no resultado de um teste de 20 minutos. A partir dos dados de batimentos cardíacos médios e pace médio informados pelo usuário, o sistema calcula sete zonas distintas de treino com seus respectivos valores de frequência cardíaca e ritmo de corrida.

## 🎯 Funcionalidades

- **Entrada de Dados**: Interface simples para informar batimentos cardíacos médios (bpm) e pace médio (min:seg/km)
- **Cálculo Automático**: Geração de 7 zonas de treino baseadas em percentuais específicos
- **Visualização em Tabela**: Apresentação clara e organizada dos resultados
- **Design Responsivo**: Funciona perfeitamente em desktop e dispositivos móveis
- **Validação de Dados**: Campos com validação automática para garantir entrada correta
- **Salvar Histórico**: Salva o histórico de testes em LocalStorage do próprio navegador de Internet
- **Modo escuro**: Inclusão de temas escuros e claros. Inicia com o mesmo tema utilizado pelo sistema. Posteriormente, utiliza a última opção escolhida.


## 🚀 Como Usar

### Instalação

1. Clone este repositório:

```bash
git clone https://github.com/acweller/teste_20minutos_corrida.git
```

2. Navegue até a pasta do projeto:

```bash
cd teste_20minutos_corrida
```

3. Abra o arquivo `index.html` em seu navegador preferido.

### Utilização

1. **Informe os Batimentos Cardíacos Médios**: Digite o valor médio de batimentos por minuto (bpm) obtido durante o teste de 20 minutos
2. **Informe o Pace Médio**: Digite os minutos e segundos do seu ritmo médio por quilômetro
3. **Clique em "Registrar Dados"**: O sistema calculará automaticamente todas as zonas
4. **Visualize os Resultados**: A tabela exibirá as 7 zonas com seus respectivos valores

## 📊 Zonas de Treino

O programa calcula 7 zonas diferentes com base nos seguintes critérios:

### Batimentos Cardíacos (Z4 como referência)

| Zona | Cálculo | Descrição |
|------|---------|-----------|
| Zona 1 | Z4 - 15% | Recuperação ativa |
| Zona 2 | Z4 - 10% | Aeróbico leve |
| Zona 3 | Z4 - 5% | Aeróbico moderado |
| Zona 4 | Valor informado | Limiar anaeróbico (base) |
| Zona 5a | Z4 + 3% | VO2 máx inicial |
| Zona 5b | Z4 + 6% | VO2 máx intermediário |
| Zona 5c | Z4 + 6% + 1 bpm | VO2 máx avançado |

### Pace (Z4 como referência)

| Zona | Cálculo | Descrição |
|------|---------|-----------|
| Zona 1 | Z4 + 29% + 1seg | Pace muito lento |
| Zona 2 | Z4 + 14% | Pace lento |
| Zona 3 | Z4 + 6% | Pace moderado |
| Zona 4 | Valor informado | Pace de limiar (base) |
| Zona 5a | Z4 - 3% | Pace rápido |
| Zona 5b | Z4 - 10% | Pace muito rápido |
| Zona 5c | Z4 - 10% - 1seg | Pace máximo |

## 🛠️ Tecnologias Utilizadas

- **HTML5**: Estrutura e marcação semântica
- **CSS3**: Estilização e design responsivo
- **JavaScript (Vanilla)**: Lógica de cálculo e manipulação do DOM

## 📁 Estrutura de Arquivos

### Estrutura do Projeto

```text
teste_20minutos_corrida/
├── index.html # Estrutura HTML do aplicativo
├── styles.css # Estilos e layout
├── script.js # Lógica de cálculo e interatividade
└── README.md # Documentação do projeto
```

## 💡 Exemplo de Uso

**Entrada:**
- Batimentos Cardíacos: 150 bpm
- Pace: 05:00 min/km

**Saída (aproximada):**

| Zona | Batimentos Máximos | Pace Mínimo |
|------|-------------------|-------------|
| Zona 1 | 128 bpm | 06:28/km |
| Zona 2 | 135 bpm | 05:42/km |
| Zona 3 | 143 bpm | 05:18/km |
| Zona 4 | 150 bpm | 05:00/km |
| Zona 5a | 155 bpm | 04:51/km |
| Zona 5b | 159 bpm | 04:30/km |
| Zona 5c | 160 bpm | 04:29/km |

## 🎨 Características do Design

- Interface limpa e moderna
- Gradiente roxo no fundo
- Tabela com hover effects
- Campos de entrada com validação visual
- Layout responsivo para dispositivos móveis
- Animações suaves nos botões

## 🔧 Funcionalidades Técnicas

- Validação automática de campos numéricos
- Conversão precisa entre minutos:segundos e segundos totais
- Arredondamento inteligente de valores calculados
- Preenchimento automático com zeros à esquerda no formato de pace
- Limite de valores para minutos e segundos (máx 59)

## 📝 Notas sobre o Teste de 20 Minutos

O teste de 20 minutos é uma forma eficaz de determinar seu limiar de lactato/limiar funcional de potência. Durante o teste:

1. Faça um aquecimento adequado de 10-15 minutos
2. Corra o mais forte que conseguir manter por 20 minutos
3. Registre seus batimentos cardíacos médios
4. Registre seu pace médio (distância total ÷ 20 minutos)
5. Use esses valores neste programa para calcular suas zonas

## 🤝 Contribuições

Contribuições são bem-vindas! Sinta-se à vontade para:

1. Fazer fork do projeto
2. Criar uma branch para sua feature (`git checkout -b feature/nova-funcionalidade`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova funcionalidade'`)
4. Push para a branch (`git push origin feature/nova-funcionalidade`)
5. Abrir um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 👤 Autor

Desenvolvido por [Anderson Weller](https://github.com/acweller), baseado nos resultados apresentados no app Corrida Perfeita.

## 📧 Contato

Para dúvidas ou sugestões:
- GitHub: [@acweller](https://github.com/acweller)

## 🔮 Melhorias Futuras

- [ ] Salvar histórico de testes em Banco de Dados
- [ ] Exportar resultados em PDF
- [ ] Gráficos de evolução
- [ ] Múltiplos perfis de usuário
- [ ] Integração com dispositivos de corrida
- [ ] Calculadora de ritmo para diferentes distâncias

---

**Desenvolvido com ❤️ para corredores**
