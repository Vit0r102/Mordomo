import { useState } from "react";
import { RotateCcw, Trash2, Save } from "lucide-react";
import { PageHeader, Card, Field, useToast } from "../components/mordomo/ui";
import { useMordomo } from "../hooks/useMordomo";

export function Configuracoes() {
  const { state, setUsuario, setConfiguracoes, restaurarDemonstracao, limparDados } = useMordomo();
  const [toast, showToast] = useToast();
  const [perfil, setPerfil] = useState({
    nome: state.usuario.nome,
    versiculo: state.usuario.versiculo,
  });
  const [config, setConfig] = useState({
    percentualDizimo: state.configuracoes.percentualDizimo ?? 10,
    metaEconomia: state.configuracoes.metaEconomia ?? 0,
  });

  return (
    <>
      <PageHeader title="Configurações" subtitle="Ajuste o Mordomo do seu jeito." />

      <div className="md-grid md-grid-2">
        <Card title="Perfil">
          <div className="md-form-grid">
            <Field label="Nome" span="full">
              <input
                className="md-input"
                value={perfil.nome}
                onChange={(e) => setPerfil({ ...perfil, nome: e.target.value })}
              />
            </Field>
            <Field label="Versículo do rodapé" span="full">
              <input
                className="md-input"
                value={perfil.versiculo}
                onChange={(e) => setPerfil({ ...perfil, versiculo: e.target.value })}
                placeholder="Ex.: Colossenses 3:23"
              />
            </Field>
          </div>
          <div className="md-modal-actions">
            <button
              className="md-button md-button-primary"
              onClick={() => {
                setUsuario({ nome: perfil.nome, versiculo: perfil.versiculo });
                showToast("Perfil atualizado.");
              }}
            >
              <Save size={15} /> Salvar perfil
            </button>
          </div>
        </Card>

        <Card title="Preferências financeiras">
          <div className="md-form-grid">
            <Field label="Percentual do dízimo (%)">
              <input
                className="md-input"
                value={config.percentualDizimo}
                onChange={(e) => setConfig({ ...config, percentualDizimo: e.target.value })}
              />
            </Field>
            <Field label="Meta mensal de economia (R$)">
              <input
                className="md-input"
                value={config.metaEconomia}
                onChange={(e) => setConfig({ ...config, metaEconomia: e.target.value })}
              />
            </Field>
          </div>
          <div className="md-modal-actions">
            <button
              className="md-button md-button-primary"
              onClick={() => {
                setConfiguracoes({
                  percentualDizimo: Number(config.percentualDizimo) || 0,
                  metaEconomia: Number(config.metaEconomia) || 0,
                });
                showToast("Preferências salvas.");
              }}
            >
              <Save size={15} /> Salvar preferências
            </button>
          </div>
        </Card>
      </div>

      <Card title="Dados">
        <p className="md-mute-xs" style={{ marginTop: 0 }}>
          Seus dados ficam guardados apenas neste navegador (localStorage).
        </p>
        <div className="md-modal-actions" style={{ justifyContent: "flex-start" }}>
          <button
            className="md-button md-button-ghost"
            onClick={() => {
              restaurarDemonstracao();
              showToast("Dados de demonstração restaurados.");
            }}
          >
            <RotateCcw size={15} /> Restaurar demonstração
          </button>
          <button
            className="md-button md-button-danger"
            onClick={() => {
              limparDados();
              showToast("Todos os dados foram apagados.");
            }}
          >
            <Trash2 size={15} /> Limpar todos os dados
          </button>
        </div>
      </Card>

      {toast}
    </>
  );
}
