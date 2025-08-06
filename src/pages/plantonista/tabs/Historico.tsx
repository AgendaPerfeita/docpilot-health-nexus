
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { usePlantonista } from '@/hooks/usePlantonista';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Calendar, Clock, User, FileText } from 'lucide-react';

const Historico = () => {
  const { sessoes, atendimentos, loading } = usePlantonista();
  const [selectedSessao, setSelectedSessao] = useState<string>('');

  const filteredAtendimentos = selectedSessao 
    ? atendimentos.filter(a => a.sessao_id === selectedSessao)
    : atendimentos;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Histórico de Atendimentos</h2>
        <select
          value={selectedSessao}
          onChange={(e) => setSelectedSessao(e.target.value)}
          className="px-3 py-2 border rounded-md"
        >
          <option value="">Todas as sessões</option>
          {sessoes.map(sessao => (
            <option key={sessao.id} value={sessao.id}>
              {format(new Date(sessao.data_inicio), "dd/MM/yyyy HH:mm", { locale: ptBR })} - {sessao.local_trabalho}
            </option>
          ))}
        </select>
      </div>

      {/* Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Sessões</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{sessoes.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Atendimentos</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{atendimentos.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Média por Sessão</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {sessoes.length > 0 ? (atendimentos.length / sessoes.length).toFixed(1) : '0'}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Atendimentos */}
      <Card>
        <CardHeader>
          <CardTitle>Atendimentos Realizados</CardTitle>
          <CardDescription>
            Histórico completo dos atendimentos {selectedSessao ? 'da sessão selecionada' : 'de todas as sessões'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="mt-2 text-muted-foreground">Carregando histórico...</p>
            </div>
          ) : filteredAtendimentos.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Nenhum atendimento encontrado
            </div>
          ) : (
            <div className="space-y-4">
              {filteredAtendimentos.map((atendimento) => (
                <div key={atendimento.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold">{atendimento.paciente_nome}</h3>
                      <p className="text-sm text-muted-foreground">
                        {atendimento.paciente_idade ? `${atendimento.paciente_idade} anos` : 'Idade não informada'} • {atendimento.paciente_sexo || 'Sexo não informado'}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={atendimento.status === 'concluido' ? 'default' : 'secondary'}>
                        {atendimento.status}
                      </Badge>
                      <div className="text-sm text-muted-foreground">
                        {format(new Date(atendimento.created_at), "dd/MM HH:mm", { locale: ptBR })}
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    {atendimento.queixa_principal && (
                      <div>
                        <span className="text-sm font-medium">Queixa Principal:</span>
                        <p className="text-sm text-muted-foreground">{atendimento.queixa_principal}</p>
                      </div>
                    )}
                    
                    {atendimento.diagnostico_final && (
                      <div>
                        <span className="text-sm font-medium">Diagnóstico:</span>
                        <p className="text-sm text-muted-foreground">{atendimento.diagnostico_final}</p>
                      </div>
                    )}
                    
                    {atendimento.conduta_final && (
                      <div>
                        <span className="text-sm font-medium">Conduta:</span>
                        <p className="text-sm text-muted-foreground">{atendimento.conduta_final}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Historico;
