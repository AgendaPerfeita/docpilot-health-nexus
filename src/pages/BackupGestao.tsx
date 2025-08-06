import { useState, useEffect } from 'react';
import { useBackup, BackupLog, BackupConfig } from '@/hooks/useBackup';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { 
  Download, 
  Upload, 
  Settings, 
  Trash2, 
  FileDown, 
  Calendar,
  Database,
  Shield,
  Clock,
  HardDrive,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

export default function BackupGestao() {
  const {
    loading,
    backups,
    config,
    exportarCompleto,
    exportarSeletivo,
    importarDados,
    listarBackups,
    downloadBackup,
    limparBackupsAntigos,
    salvarConfiguracao,
    carregarConfiguracao
  } = useBackup();

  const [activeTab, setActiveTab] = useState('dashboard');
  const [exportConfig, setExportConfig] = useState({
    tabelas: ['pacientes', 'consultas', 'prontuarios'],
    data_inicio: '',
    data_fim: ''
  });
  const [importFile, setImportFile] = useState<File | null>(null);

  useEffect(() => {
    carregarConfiguracao();
    listarBackups();
  }, []);

  const handleExportCompleto = async () => {
    try {
      await exportarCompleto();
    } catch (error) {
      console.error('Erro no export completo:', error);
    }
  };

  const handleExportSeletivo = async () => {
    try {
      await exportarSeletivo(exportConfig);
    } catch (error) {
      console.error('Erro no export seletivo:', error);
    }
  };

  const handleImport = async () => {
    if (!importFile) {
      toast.error('Selecione um arquivo de backup');
      return;
    }

    try {
      const fileText = await importFile.text();
      const backupData = JSON.parse(fileText);
      await importarDados(backupData);
    } catch (error) {
      toast.error('Arquivo de backup inválido');
      console.error('Erro na importação:', error);
    }
  };

  const handleConfigSave = async (newConfig: Partial<BackupConfig>) => {
    try {
      await salvarConfiguracao(newConfig);
    } catch (error) {
      console.error('Erro ao salvar config:', error);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'concluido':
        return <CheckCircle className="h-4 w-4 text-success" />;
      case 'erro':
        return <XCircle className="h-4 w-4 text-destructive" />;
      case 'processando':
        return <Loader2 className="h-4 w-4 text-warning animate-spin" />;
      default:
        return <AlertCircle className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      concluido: 'default',
      erro: 'destructive',
      processando: 'secondary',
      iniciado: 'outline'
    };
    
    return <Badge variant={variants[status] || 'outline'}>{status}</Badge>;
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'N/A';
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`;
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <Shield className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">Gestão de Backup</h1>
          <p className="text-muted-foreground">
            Sistema completo de backup e recuperação de dados
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="export">Exportar</TabsTrigger>
          <TabsTrigger value="import">Importar</TabsTrigger>
          <TabsTrigger value="configuracoes">Configurações</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total de Backups</CardTitle>
                <Database className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{backups.length}</div>
                <p className="text-xs text-muted-foreground">
                  {backups.filter(b => b.status === 'concluido').length} concluídos
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Último Backup</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {backups[0] ? format(new Date(backups[0].created_at), 'dd/MM') : 'N/A'}
                </div>
                <p className="text-xs text-muted-foreground">
                  {backups[0] ? getStatusBadge(backups[0].status) : 'Nenhum backup'}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Espaço Total</CardTitle>
                <HardDrive className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatFileSize(backups.reduce((sum, b) => sum + (b.tamanho_bytes || 0), 0))}
                </div>
                <p className="text-xs text-muted-foreground">
                  {backups.filter(b => b.status === 'concluido').length} arquivos
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Histórico de Backups</CardTitle>
              <CardDescription>
                Últimos backups criados e seus status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {backups.map((backup) => (
                  <div key={backup.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(backup.status)}
                      <div>
                        <div className="font-medium capitalize">
                          {backup.tipo.replace('_', ' ')}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {format(new Date(backup.created_at), 'dd/MM/yyyy HH:mm')}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {getStatusBadge(backup.status)}
                      {backup.tamanho_bytes && (
                        <span className="text-sm text-muted-foreground">
                          {formatFileSize(backup.tamanho_bytes)}
                        </span>
                      )}
                      {backup.status === 'concluido' && backup.arquivo_url && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => downloadBackup(backup.id)}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}

                {backups.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    Nenhum backup encontrado. Crie seu primeiro backup!
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="export" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Download className="h-5 w-5" />
                  Backup Completo
                </CardTitle>
                <CardDescription>
                  Exporta todos os seus dados (pacientes, consultas, prontuários e anexos)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  onClick={handleExportCompleto}
                  disabled={loading}
                  className="w-full"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Criando backup...
                    </>
                  ) : (
                    <>
                      <Download className="h-4 w-4 mr-2" />
                      Criar Backup Completo
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileDown className="h-5 w-5" />
                  Backup Seletivo
                </CardTitle>
                <CardDescription>
                  Exporta apenas dados específicos com filtros personalizados
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Tabelas a exportar</Label>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {[
                      { id: 'pacientes', label: 'Pacientes' },
                      { id: 'consultas', label: 'Consultas' },
                      { id: 'prontuarios', label: 'Prontuários' },
                      { id: 'anexos_medicos', label: 'Anexos' }
                    ].map((tabela) => (
                      <div key={tabela.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={tabela.id}
                          checked={exportConfig.tabelas.includes(tabela.id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setExportConfig(prev => ({
                                ...prev,
                                tabelas: [...prev.tabelas, tabela.id]
                              }));
                            } else {
                              setExportConfig(prev => ({
                                ...prev,
                                tabelas: prev.tabelas.filter(t => t !== tabela.id)
                              }));
                            }
                          }}
                        />
                        <Label htmlFor={tabela.id}>{tabela.label}</Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="data_inicio">Data início</Label>
                    <Input
                      id="data_inicio"
                      type="date"
                      value={exportConfig.data_inicio}
                      onChange={(e) => setExportConfig(prev => ({ ...prev, data_inicio: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="data_fim">Data fim</Label>
                    <Input
                      id="data_fim"
                      type="date"
                      value={exportConfig.data_fim}
                      onChange={(e) => setExportConfig(prev => ({ ...prev, data_fim: e.target.value }))}
                    />
                  </div>
                </div>

                <Button 
                  onClick={handleExportSeletivo}
                  disabled={loading || exportConfig.tabelas.length === 0}
                  className="w-full"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Criando backup...
                    </>
                  ) : (
                    <>
                      <FileDown className="h-4 w-4 mr-2" />
                      Criar Backup Seletivo
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="import" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Importar Backup
              </CardTitle>
              <CardDescription>
                Restaure dados de um arquivo de backup anterior
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="backup-file">Arquivo de Backup</Label>
                <Input
                  id="backup-file"
                  type="file"
                  accept=".json"
                  onChange={(e) => setImportFile(e.target.files?.[0] || null)}
                  className="mt-2"
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Apenas arquivos JSON de backup são aceitos
                </p>
              </div>

              <div className="bg-warning/10 border border-warning/20 rounded-lg p-4">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-5 w-5 text-warning flex-shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium text-warning">Atenção!</p>
                    <p className="text-warning/80">
                      A importação criará novos registros. Dados existentes não serão substituídos.
                      Certifique-se de que o arquivo é um backup válido.
                    </p>
                  </div>
                </div>
              </div>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button 
                    disabled={!importFile || loading}
                    className="w-full"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Importando...
                      </>
                    ) : (
                      <>
                        <Upload className="h-4 w-4 mr-2" />
                        Importar Dados
                      </>
                    )}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Confirmar Importação</AlertDialogTitle>
                    <AlertDialogDescription>
                      Esta ação irá importar os dados do arquivo selecionado. 
                      Novos registros serão criados no sistema. Continuar?
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={handleImport}>
                      Confirmar Importação
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="configuracoes" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Configurações de Backup
              </CardTitle>
              <CardDescription>
                Configure backup automático e políticas de retenção
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {config && (
                <>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Backup Automático</Label>
                      <p className="text-sm text-muted-foreground">
                        Ativar backups automáticos programados
                      </p>
                    </div>
                    <Switch
                      checked={config.backup_automatico}
                      onCheckedChange={(checked) => 
                        handleConfigSave({ backup_automatico: checked })
                      }
                    />
                  </div>

                  {config.backup_automatico && (
                    <>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Frequência</Label>
                          <Select 
                            value={config.frequencia} 
                            onValueChange={(value: 'diario' | 'semanal' | 'mensal') => 
                              handleConfigSave({ frequencia: value })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="diario">Diário</SelectItem>
                              <SelectItem value="semanal">Semanal</SelectItem>
                              <SelectItem value="mensal">Mensal</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label>Horário</Label>
                          <Input
                            type="time"
                            value={config.horario}
                            onChange={(e) => handleConfigSave({ horario: e.target.value })}
                          />
                        </div>
                      </div>

                      <div>
                        <Label>Retenção (dias)</Label>
                        <Input
                          type="number"
                          min="1"
                          max="365"
                          value={config.retencao_dias}
                          onChange={(e) => handleConfigSave({ retencao_dias: parseInt(e.target.value) })}
                          className="mt-1"
                        />
                        <p className="text-sm text-muted-foreground mt-1">
                          Backups mais antigos serão removidos automaticamente
                        </p>
                      </div>
                    </>
                  )}

                  <div className="space-y-4">
                    <h4 className="font-medium">Opções de Backup</h4>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Incluir Anexos</Label>
                        <p className="text-sm text-muted-foreground">
                          Backup de documentos e anexos médicos
                        </p>
                      </div>
                      <Switch
                        checked={config.incluir_anexos}
                        onCheckedChange={(checked) => 
                          handleConfigSave({ incluir_anexos: checked })
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Incluir Imagens</Label>
                        <p className="text-sm text-muted-foreground">
                          Backup de imagens e fotos
                        </p>
                      </div>
                      <Switch
                        checked={config.incluir_imagens}
                        onCheckedChange={(checked) => 
                          handleConfigSave({ incluir_imagens: checked })
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Compressão</Label>
                        <p className="text-sm text-muted-foreground">
                          Comprimir arquivos para economizar espaço
                        </p>
                      </div>
                      <Switch
                        checked={config.compressao}
                        onCheckedChange={(checked) => 
                          handleConfigSave({ compressao: checked })
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Notificar por Email</Label>
                        <p className="text-sm text-muted-foreground">
                          Receber notificações sobre backups
                        </p>
                      </div>
                      <Switch
                        checked={config.notificar_email}
                        onCheckedChange={(checked) => 
                          handleConfigSave({ notificar_email: checked })
                        }
                      />
                    </div>
                  </div>

                  <div className="pt-4 border-t">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-destructive">Limpeza de Backups</h4>
                        <p className="text-sm text-muted-foreground">
                          Remove backups antigos baseado na política de retenção
                        </p>
                      </div>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            <Trash2 className="h-4 w-4 mr-2" />
                            Limpar Antigos
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Confirmar Limpeza</AlertDialogTitle>
                            <AlertDialogDescription>
                              Esta ação irá remover permanentemente backups antigos 
                              com mais de {config.retencao_dias} dias. Esta ação não pode ser desfeita.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction 
                              onClick={limparBackupsAntigos}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Confirmar Limpeza
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}