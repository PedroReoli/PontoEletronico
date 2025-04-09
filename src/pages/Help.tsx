"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Layout from "../components/Layout"

function Help() {
  const [activeCategory, setActiveCategory] = useState("getting-started")
  const [expandedFaq, setExpandedFaq] = useState<string | null>(null)

  const toggleFaq = (id: string) => {
    setExpandedFaq(expandedFaq === id ? null : id)
  }

  return (
    <Layout>
      <div className="help-page">
        <motion.div
          className="help-header"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1>Central de Ajuda</h1>
          <p>Encontre respostas para suas dúvidas e aprenda a usar o sistema</p>
        </motion.div>

        <div className="help-content">
          <motion.div
            className="help-sidebar"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h2>Categorias</h2>
            <ul className="category-list">
              <li
                className={activeCategory === "getting-started" ? "active" : ""}
                onClick={() => setActiveCategory("getting-started")}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                  <polyline points="9 22 9 12 15 12 15 22"></polyline>
                </svg>
                Primeiros Passos
              </li>
              <li
                className={activeCategory === "timesheet" ? "active" : ""}
                onClick={() => setActiveCategory("timesheet")}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="10"></circle>
                  <polyline points="12 6 12 12 16 14"></polyline>
                </svg>
                Registro de Ponto
              </li>
              <li className={activeCategory === "reports" ? "active" : ""} onClick={() => setActiveCategory("reports")}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                  <polyline points="14 2 14 8 20 8"></polyline>
                  <line x1="16" y1="13" x2="8" y2="13"></line>
                  <line x1="16" y1="17" x2="8" y2="17"></line>
                  <polyline points="10 9 9 9 8 9"></polyline>
                </svg>
                Relatórios
              </li>
              <li
                className={activeCategory === "adjustments" ? "active" : ""}
                onClick={() => setActiveCategory("adjustments")}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="3"></circle>
                  <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
                </svg>
                Ajustes de Ponto
              </li>
              <li className={activeCategory === "account" ? "active" : ""} onClick={() => setActiveCategory("account")}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
                Conta e Perfil
              </li>
              <li
                className={activeCategory === "troubleshooting" ? "active" : ""}
                onClick={() => setActiveCategory("troubleshooting")}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="8" x2="12" y2="12"></line>
                  <line x1="12" y1="16" x2="12.01" y2="16"></line>
                </svg>
                Solução de Problemas
              </li>
            </ul>

            <div className="help-contact">
              <h3>Precisa de mais ajuda?</h3>
              <p>Nossa equipe de suporte está disponível para ajudar você.</p>
              <button className="btn btn-primary">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                </svg>
                Contatar Suporte
              </button>
            </div>
          </motion.div>

          <motion.div
            className="help-main"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            {activeCategory === "getting-started" && (
              <div className="help-category">
                <h2>Primeiros Passos</h2>
                <p className="category-description">
                  Aprenda o básico sobre como começar a usar o sistema de controle de ponto.
                </p>

                <div className="faq-list">
                  <div className="faq-item">
                    <div className="faq-question" onClick={() => toggleFaq("gs1")}>
                      <h3>Como faço login no sistema?</h3>
                      <span className={`faq-toggle ${expandedFaq === "gs1" ? "open" : ""}`}>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <polyline points="6 9 12 15 18 9"></polyline>
                        </svg>
                      </span>
                    </div>
                    <AnimatePresence>
                      {expandedFaq === "gs1" && (
                        <motion.div
                          className="faq-answer"
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3 }}
                        >
                          <p>
                            Para fazer login no sistema, acesse a página inicial e insira seu e-mail e senha nos campos
                            correspondentes. Caso seja seu primeiro acesso, você deve ter recebido um e-mail com suas
                            credenciais iniciais. Se você esqueceu sua senha, clique em "Esqueceu a senha?" para
                            redefini-la.
                          </p>
                          <div className="help-image">
                            <img src="/placeholder.svg?height=200&width=400" alt="Tela de login" />
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  <div className="faq-item">
                    <div className="faq-question" onClick={() => toggleFaq("gs2")}>
                      <h3>Como navegar pelo sistema?</h3>
                      <span className={`faq-toggle ${expandedFaq === "gs2" ? "open" : ""}`}>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <polyline points="6 9 12 15 18 9"></polyline>
                        </svg>
                      </span>
                    </div>
                    <AnimatePresence>
                      {expandedFaq === "gs2" && (
                        <motion.div
                          className="faq-answer"
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3 }}
                        >
                          <p>
                            O sistema possui um menu lateral que contém todas as principais funcionalidades. Dependendo
                            do seu perfil de acesso (Funcionário, Gestor ou Administrador), você verá diferentes opções
                            disponíveis. Você pode clicar nos itens do menu para acessar as diferentes seções do
                            sistema.
                          </p>
                          <p>
                            Em dispositivos móveis, o menu lateral pode ser acessado clicando no ícone de hambúrguer no
                            canto superior esquerdo da tela.
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  <div className="faq-item">
                    <div className="faq-question" onClick={() => toggleFaq("gs3")}>
                      <h3>Como alterar minha senha?</h3>
                      <span className={`faq-toggle ${expandedFaq === "gs3" ? "open" : ""}`}>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <polyline points="6 9 12 15 18 9"></polyline>
                        </svg>
                      </span>
                    </div>
                    <AnimatePresence>
                      {expandedFaq === "gs3" && (
                        <motion.div
                          className="faq-answer"
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3 }}
                        >
                          <p>
                            Para alterar sua senha, acesse a página de Configurações através do menu lateral ou clicando
                            no seu perfil no canto superior direito e selecionando "Configurações". Na seção de
                            segurança, você encontrará a opção para alterar sua senha.
                          </p>
                          <ol>
                            <li>Insira sua senha atual</li>
                            <li>Digite sua nova senha</li>
                            <li>Confirme a nova senha</li>
                            <li>Clique em "Salvar alterações"</li>
                          </ol>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </div>
            )}

            {activeCategory === "timesheet" && (
              <div className="help-category">
                <h2>Registro de Ponto</h2>
                <p className="category-description">
                  Saiba como registrar seu ponto diário e gerenciar seus horários de trabalho.
                </p>

                <div className="faq-list">
                  <div className="faq-item">
                    <div className="faq-question" onClick={() => toggleFaq("ts1")}>
                      <h3>Como registrar meu ponto?</h3>
                      <span className={`faq-toggle ${expandedFaq === "ts1" ? "open" : ""}`}>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <polyline points="6 9 12 15 18 9"></polyline>
                        </svg>
                      </span>
                    </div>
                    <AnimatePresence>
                      {expandedFaq === "ts1" && (
                        <motion.div
                          className="faq-answer"
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3 }}
                        >
                          <p>
                            Para registrar seu ponto, acesse a página "Registro de Ponto" no menu lateral. Você verá
                            botões para registrar:
                          </p>
                          <ul>
                            <li>
                              <strong>Entrada:</strong> No início do expediente
                            </li>
                            <li>
                              <strong>Início do Intervalo:</strong> Quando sair para almoço ou pausa
                            </li>
                            <li>
                              <strong>Fim do Intervalo:</strong> Quando retornar do almoço ou pausa
                            </li>
                            <li>
                              <strong>Saída:</strong> No final do expediente
                            </li>
                          </ul>
                          <p>
                            O sistema mostrará apenas o botão correspondente à próxima ação que você deve realizar,
                            seguindo a sequência lógica do seu dia de trabalho.
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  <div className="faq-item">
                    <div className="faq-question" onClick={() => toggleFaq("ts2")}>
                      <h3>Por que o sistema pede minha localização?</h3>
                      <span className={`faq-toggle ${expandedFaq === "ts2" ? "open" : ""}`}>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <polyline points="6 9 12 15 18 9"></polyline>
                        </svg>
                      </span>
                    </div>
                    <AnimatePresence>
                      {expandedFaq === "ts2" && (
                        <motion.div
                          className="faq-answer"
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3 }}
                        >
                          <p>
                            O sistema solicita sua localização para registrar de onde você está fazendo o registro de
                            ponto. Isso é uma medida de segurança e conformidade, especialmente para empresas que
                            precisam verificar se os funcionários estão registrando o ponto de locais autorizados.
                          </p>
                          <p>
                            Você precisa permitir o acesso à sua localização no navegador para que o registro de ponto
                            funcione corretamente. Caso contrário, o sistema exibirá uma mensagem de erro.
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  <div className="faq-item">
                    <div className="faq-question" onClick={() => toggleFaq("ts3")}>
                      <h3>O que fazer se esquecer de registrar o ponto?</h3>
                      <span className={`faq-toggle ${expandedFaq === "ts3" ? "open" : ""}`}>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <polyline points="6 9 12 15 18 9"></polyline>
                        </svg>
                      </span>
                    </div>
                    <AnimatePresence>
                      {expandedFaq === "ts3" && (
                        <motion.div
                          className="faq-answer"
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3 }}
                        >
                          <p>Se você esquecer de registrar seu ponto, deverá solicitar um ajuste. Para isso:</p>
                          <ol>
                            <li>Acesse a página "Registro de Ponto"</li>
                            <li>Clique no botão "Nova Solicitação" na seção de ajustes</li>
                            <li>Preencha o formulário com a data, tipo de registro e horário correto</li>
                            <li>Explique o motivo do esquecimento</li>
                            <li>Envie a solicitação para aprovação do seu gestor</li>
                          </ol>
                          <p>
                            Seu gestor receberá a solicitação e poderá aprová-la ou rejeitá-la. Você receberá uma
                            notificação quando houver uma resposta.
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </div>
            )}

            {activeCategory === "reports" && (
              <div className="help-category">
                <h2>Relatórios</h2>
                <p className="category-description">
                  Aprenda como visualizar e exportar relatórios de ponto e horas trabalhadas.
                </p>

                <div className="faq-list">
                  <div className="faq-item">
                    <div className="faq-question" onClick={() => toggleFaq("rp1")}>
                      <h3>Como acessar meu relatório mensal?</h3>
                      <span className={`faq-toggle ${expandedFaq === "rp1" ? "open" : ""}`}>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <polyline points="6 9 12 15 18 9"></polyline>
                        </svg>
                      </span>
                    </div>
                    <AnimatePresence>
                      {expandedFaq === "rp1" && (
                        <motion.div
                          className="faq-answer"
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3 }}
                        >
                          <p>
                            Para acessar seu relatório mensal, navegue até a página "Relatórios" no menu lateral. Lá
                            você encontrará:
                          </p>
                          <ol>
                            <li>Seletores de mês e ano para escolher o período desejado</li>
                            <li>Uma tabela com todos os registros do período selecionado</li>
                            <li>Totalizadores de horas trabalhadas, intervalos e saldo</li>
                          </ol>
                          <p>Você pode navegar entre os meses usando os seletores no topo da página.</p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  <div className="faq-item">
                    <div className="faq-question" onClick={() => toggleFaq("rp2")}>
                      <h3>Como exportar relatórios?</h3>
                      <span className={`faq-toggle ${expandedFaq === "rp2" ? "open" : ""}`}>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <polyline points="6 9 12 15 18 9"></polyline>
                        </svg>
                      </span>
                    </div>
                    <AnimatePresence>
                      {expandedFaq === "rp2" && (
                        <motion.div
                          className="faq-answer"
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3 }}
                        >
                          <p>Para exportar um relatório, siga estes passos:</p>
                          <ol>
                            <li>Acesse a página "Relatórios"</li>
                            <li>Selecione o mês e ano desejados</li>
                            <li>Clique no botão "Exportar CSV" no canto superior direito</li>
                          </ol>
                          <p>
                            O arquivo será baixado automaticamente para o seu dispositivo. Você pode abri-lo em
                            programas como Microsoft Excel, Google Planilhas ou qualquer outro software que suporte
                            arquivos CSV.
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </div>
            )}

            {activeCategory === "adjustments" && (
              <div className="help-category">
                <h2>Ajustes de Ponto</h2>
                <p className="category-description">
                  Saiba como solicitar ajustes em seus registros de ponto e acompanhar suas solicitações.
                </p>

                <div className="faq-list">
                  <div className="faq-item">
                    <div className="faq-question" onClick={() => toggleFaq("adj1")}>
                      <h3>Como solicitar um ajuste de ponto?</h3>
                      <span className={`faq-toggle ${expandedFaq === "adj1" ? "open" : ""}`}>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <polyline points="6 9 12 15 18 9"></polyline>
                        </svg>
                      </span>
                    </div>
                    <AnimatePresence>
                      {expandedFaq === "adj1" && (
                        <motion.div
                          className="faq-answer"
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3 }}
                        >
                          <p>Para solicitar um ajuste de ponto:</p>
                          <ol>
                            <li>Acesse a página "Registro de Ponto"</li>
                            <li>Clique no botão "Nova Solicitação" na seção de ajustes</li>
                            <li>Selecione a data que precisa de ajuste</li>
                            <li>Escolha o tipo de registro (Entrada, Saída, Início ou Fim de Intervalo)</li>
                            <li>Informe o horário correto</li>
                            <li>Explique o motivo da solicitação</li>
                            <li>Se necessário, anexe um comprovante</li>
                            <li>Clique em "Enviar Solicitação"</li>
                          </ol>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  <div className="faq-item">
                    <div className="faq-question" onClick={() => toggleFaq("adj2")}>
                      <h3>Como acompanhar minhas solicitações de ajuste?</h3>
                      <span className={`faq-toggle ${expandedFaq === "adj2" ? "open" : ""}`}>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <polyline points="6 9 12 15 18 9"></polyline>
                        </svg>
                      </span>
                    </div>
                    <AnimatePresence>
                      {expandedFaq === "adj2" && (
                        <motion.div
                          className="faq-answer"
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3 }}
                        >
                          <p>
                            Você pode acompanhar suas solicitações de ajuste na seção "Minhas Solicitações" na página de
                            Registro de Ponto. Lá você verá:
                          </p>
                          <ul>
                            <li>Todas as suas solicitações recentes</li>
                            <li>O status de cada solicitação (Pendente, Aprovada ou Rejeitada)</li>
                            <li>Comentários do gestor, quando houver</li>
                          </ul>
                          <p>Você também receberá notificações quando o status de uma solicitação for alterado.</p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </div>
            )}

            {activeCategory === "account" && (
              <div className="help-category">
                <h2>Conta e Perfil</h2>
                <p className="category-description">Gerencie suas informações pessoais e configurações de conta.</p>

                <div className="faq-list">
                  <div className="faq-item">
                    <div className="faq-question" onClick={() => toggleFaq("acc1")}>
                      <h3>Como atualizar meus dados pessoais?</h3>
                      <span className={`faq-toggle ${expandedFaq === "acc1" ? "open" : ""}`}>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <polyline points="6 9 12 15 18 9"></polyline>
                        </svg>
                      </span>
                    </div>
                    <AnimatePresence>
                      {expandedFaq === "acc1" && (
                        <motion.div
                          className="faq-answer"
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3 }}
                        >
                          <p>Para atualizar seus dados pessoais:</p>
                          <ol>
                            <li>Clique no seu perfil no canto superior direito</li>
                            <li>Selecione "Seu Perfil" no menu</li>
                            <li>Clique em "Editar Perfil"</li>
                            <li>Atualize as informações necessárias</li>
                            <li>Clique em "Salvar Alterações"</li>
                          </ol>
                          <p>Alguns dados podem exigir aprovação do administrador para serem alterados.</p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  <div className="faq-item">
                    <div className="faq-question" onClick={() => toggleFaq("acc2")}>
                      <h3>Como configurar notificações?</h3>
                      <span className={`faq-toggle ${expandedFaq === "acc2" ? "open" : ""}`}>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <polyline points="6 9 12 15 18 9"></polyline>
                        </svg>
                      </span>
                    </div>
                    <AnimatePresence>
                      {expandedFaq === "acc2" && (
                        <motion.div
                          className="faq-answer"
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3 }}
                        >
                          <p>Para configurar suas preferências de notificação:</p>
                          <ol>
                            <li>Acesse a página "Configurações" através do menu do perfil</li>
                            <li>Navegue até a seção "Notificações"</li>
                            <li>Ative ou desative os tipos de notificação que deseja receber</li>
                            <li>Escolha como deseja receber cada tipo de notificação (no sistema, por e-mail, etc.)</li>
                            <li>Clique em "Salvar Preferências"</li>
                          </ol>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </div>
            )}

            {activeCategory === "troubleshooting" && (
              <div className="help-category">
                <h2>Solução de Problemas</h2>
                <p className="category-description">
                  Encontre soluções para problemas comuns que você pode encontrar ao usar o sistema.
                </p>

                <div className="faq-list">
                  <div className="faq-item">
                    <div className="faq-question" onClick={() => toggleFaq("tr1")}>
                      <h3>O sistema não está registrando minha localização</h3>
                      <span className={`faq-toggle ${expandedFaq === "tr1" ? "open" : ""}`}>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <polyline points="6 9 12 15 18 9"></polyline>
                        </svg>
                      </span>
                    </div>
                    <AnimatePresence>
                      {expandedFaq === "tr1" && (
                        <motion.div
                          className="faq-answer"
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3 }}
                        >
                          <p>Se o sistema não está conseguindo obter sua localização, verifique:</p>
                          <ol>
                            <li>Se você permitiu o acesso à localização no navegador</li>
                            <li>Se o GPS do seu dispositivo está ativado</li>
                            <li>
                              Se você está usando um navegador compatível (Chrome, Firefox, Safari ou Edge atualizados)
                            </li>
                            <li>Se você está conectado à internet</li>
                          </ol>
                          <p>Para verificar as permissões de localização:</p>
                          <ul>
                            <li>
                              No Chrome: Clique no ícone de cadeado na barra de endereço e verifique as permissões do
                              site
                            </li>
                            <li>
                              No Firefox: Clique no ícone de informações na barra de endereço e verifique as permissões
                            </li>
                            <li>No Safari: Acesse Preferências &gt; Websites &gt; Localização</li>
                          </ul>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  <div className="faq-item">
                    <div className="faq-question" onClick={() => toggleFaq("tr2")}>
                      <h3>Não consigo fazer login no sistema</h3>
                      <span className={`faq-toggle ${expandedFaq === "tr2" ? "open" : ""}`}>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <polyline points="6 9 12 15 18 9"></polyline>
                        </svg>
                      </span>
                    </div>
                    <AnimatePresence>
                      {expandedFaq === "tr2" && (
                        <motion.div
                          className="faq-answer"
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3 }}
                        >
                          <p>Se você está tendo problemas para fazer login, verifique:</p>
                          <ol>
                            <li>Se está digitando o e-mail e senha corretamente (verifique o Caps Lock)</li>
                            <li>Se sua conta não está bloqueada (após várias tentativas incorretas)</li>
                            <li>Se sua conta está ativa (consulte seu administrador)</li>
                            <li>Se você está conectado à internet</li>
                          </ol>
                          <p>
                            Se ainda não conseguir acessar, use a opção "Esqueceu a senha?" na tela de login para
                            redefinir sua senha ou entre em contato com o suporte.
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </Layout>
  )
}

export default Help
