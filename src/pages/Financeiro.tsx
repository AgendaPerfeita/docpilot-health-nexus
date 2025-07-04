import { useState } from "react"
import { DollarSign, TrendingUp, TrendingDown, Plus, Calendar, Filter, Search, Download } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface Transaction {
  id: string
  type: 'entrada' | 'saida'
  description: string
  amount: number
  category: string
  date: string
  paymentMethod: string
  status: 'realizado' | 'pendente' | 'cancelado'
  patient?: string
  professional?: string
}

const mockTransactions: Transaction[] = [
  {
    id: '1',
    type: 'entrada',
    description: 'Consulta - Ana Silva',
    amount: 200,
    category: 'Consultas',
    date: '2024-01-15',
    paymentMethod: 'Cartão',
    status: 'realizado',
    patient: 'Ana Silva',
    professional: 'Dr. João Silva'
  },
  {
    id: '2',
    type: 'entrada',
    description: 'Exame - Carlos Santos',
    amount: 150,
    category: 'Exames',
    date: '2024-01-14',
    paymentMethod: 'PIX',
    status: 'realizado',
    patient: 'Carlos Santos',
    professional: 'Dr. João Silva'
  },
  {
    id: '3',
    type: 'saida',
    description: 'Aluguel da Clínica',
    amount: 3000,
    category: 'Despesas Fixas',
    date: '2024-01-10',
    paymentMethod: 'Transferência',
    status: 'realizado'
  },
  {
    id: '4',
    type: 'saida',
    description: 'Material Médico',
    amount: 500,
    category: 'Despesas Variáveis',
    date: '2024-01-12',
    paymentMethod: 'Cartão',
    status: 'realizado'
  }
]

export default function Financeiro() {
  const [transactions, setTransactions] = useState<Transaction[]>(mockTransactions)
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState<string>('todos')
  const [categoryFilter, setCategoryFilter] = useState<string>('todos')
  const [isAddingTransaction, setIsAddingTransaction] = useState(false)
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7))

  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = transaction.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = typeFilter === 'todos' || transaction.type === typeFilter
    const matchesCategory = categoryFilter === 'todos' || transaction.category === categoryFilter
    const matchesMonth = transaction.date.startsWith(selectedMonth)
    
    return matchesSearch && matchesType && matchesCategory && matchesMonth
  })

  const getFinancialSummary = () => {
    const currentMonthTransactions = transactions.filter(t => t.date.startsWith(selectedMonth))
    
    const totalEntradas = currentMonthTransactions
      .filter(t => t.type === 'entrada' && t.status === 'realizado')
      .reduce((sum, t) => sum + t.amount, 0)
    
    const totalSaidas = currentMonthTransactions
      .filter(t => t.type === 'saida' && t.status === 'realizado')
      .reduce((sum, t) => sum + t.amount, 0)
    
    const saldoLiquido = totalEntradas - totalSaidas
    
    return { totalEntradas, totalSaidas, saldoLiquido }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'realizado': return 'bg-green-100 text-green-800 border-green-200'
      case 'pendente': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'cancelado': return 'bg-red-100 text-red-800 border-red-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const handleAddTransaction = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    
    const newTransaction: Transaction = {
      id: Date.now().toString(),
      type: formData.get('type') as 'entrada' | 'saida',
      description: formData.get('description') as string,
      amount: Number(formData.get('amount')),
      category: formData.get('category') as string,
      date: formData.get('date') as string,
      paymentMethod: formData.get('paymentMethod') as string,
      status: 'realizado',
      patient: formData.get('patient') as string || undefined,
      professional: formData.get('professional') as string || undefined
    }
    
    setTransactions([...transactions, newTransaction])
    setIsAddingTransaction(false)
  }

  const summary = getFinancialSummary()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Fluxo de Caixa</h1>
          <p className="text-muted-foreground">Controle financeiro da clínica</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Exportar
          </Button>
          <Dialog open={isAddingTransaction} onOpenChange={setIsAddingTransaction}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Nova Transação
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Nova Transação</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleAddTransaction} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="type">Tipo</Label>
                    <Select name="type" required>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecionar tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="entrada">Entrada</SelectItem>
                        <SelectItem value="saida">Saída</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="amount">Valor (R$)</Label>
                    <Input id="amount" name="amount" type="number" step="0.01" required />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Descrição</Label>
                  <Input id="description" name="description" required />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="category">Categoria</Label>
                    <Select name="category" required>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecionar categoria" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Consultas">Consultas</SelectItem>
                        <SelectItem value="Exames">Exames</SelectItem>
                        <SelectItem value="Procedimentos">Procedimentos</SelectItem>
                        <SelectItem value="Despesas Fixas">Despesas Fixas</SelectItem>
                        <SelectItem value="Despesas Variáveis">Despesas Variáveis</SelectItem>
                        <SelectItem value="Materiais">Materiais</SelectItem>
                        <SelectItem value="Equipamentos">Equipamentos</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="paymentMethod">Forma de Pagamento</Label>
                    <Select name="paymentMethod" required>
                      <SelectTrigger>
                        <SelectValue placeholder="Forma de pagamento" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Dinheiro">Dinheiro</SelectItem>
                        <SelectItem value="Cartão">Cartão</SelectItem>
                        <SelectItem value="PIX">PIX</SelectItem>
                        <SelectItem value="Transferência">Transferência</SelectItem>
                        <SelectItem value="Boleto">Boleto</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="date">Data</Label>
                    <Input id="date" name="date" type="date" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="patient">Paciente (opcional)</Label>
                    <Input id="patient" name="patient" />
                  </div>
                </div>

                <div className="flex gap-2 justify-end">
                  <Button type="button" variant="outline" onClick={() => setIsAddingTransaction(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit">Salvar</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-600" />
                <span className="text-sm font-medium">Entradas</span>
              </div>
              <span className="text-2xl font-bold text-green-600">
                R$ {summary.totalEntradas.toLocaleString('pt-BR')}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {new Date(selectedMonth).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingDown className="h-5 w-5 text-red-600" />
                <span className="text-sm font-medium">Saídas</span>
              </div>
              <span className="text-2xl font-bold text-red-600">
                R$ {summary.totalSaidas.toLocaleString('pt-BR')}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {new Date(selectedMonth).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-blue-600" />
                <span className="text-sm font-medium">Saldo Líquido</span>
              </div>
              <span className={`text-2xl font-bold ${summary.saldoLiquido >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                R$ {summary.saldoLiquido.toLocaleString('pt-BR')}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {new Date(selectedMonth).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Transações</CardTitle>
            <div className="flex gap-2">
              <Input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="w-40"
              />
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar transações..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="entrada">Entradas</SelectItem>
                  <SelectItem value="saida">Saídas</SelectItem>
                </SelectContent>
              </Select>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todas</SelectItem>
                  <SelectItem value="Consultas">Consultas</SelectItem>
                  <SelectItem value="Exames">Exames</SelectItem>
                  <SelectItem value="Despesas Fixas">Despesas Fixas</SelectItem>
                  <SelectItem value="Despesas Variáveis">Despesas Variáveis</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredTransactions.map((transaction) => (
              <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className={`w-3 h-3 rounded-full ${transaction.type === 'entrada' ? 'bg-green-500' : 'bg-red-500'}`} />
                  <div>
                    <div className="font-medium text-foreground">{transaction.description}</div>
                    <div className="text-sm text-muted-foreground">
                      {transaction.category} • {transaction.paymentMethod} • {new Date(transaction.date).toLocaleDateString('pt-BR')}
                    </div>
                    {transaction.patient && (
                      <div className="text-sm text-muted-foreground">
                        Paciente: {transaction.patient}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <Badge className={getStatusColor(transaction.status)}>
                    {transaction.status}
                  </Badge>
                  <div className={`text-lg font-bold ${transaction.type === 'entrada' ? 'text-green-600' : 'text-red-600'}`}>
                    {transaction.type === 'entrada' ? '+' : '-'}R$ {transaction.amount.toLocaleString('pt-BR')}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}