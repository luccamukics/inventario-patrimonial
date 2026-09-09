import React, { useEffect, useMemo, useState } from 'react';
import {
    Boxes,
    Building2,
    Download,
    LogOut,
    Pencil,
    Plus,
    RefreshCcw,
    Search,
    ShieldCheck,
    Trash2
} from 'lucide-react';
import { api, API_URL, clearToken, getToken, setToken } from './api';

const formVazio = {
    serial_number: '',
    patrimonio: '',
    tipo: 'Notebook',
    marca: '',
    modelo: '',
    status_ativo: 'Disponivel',
    campus_id: '',
    predio_id: '',
    setor_id: '',
    categoria_id: ''
};

function Login({ onLogin }) {
    const [email, setEmail] = useState('admin@inventario.local');
    const [senha, setSenha] = useState('admin123');
    const [erro, setErro] = useState('');
    const [carregando, setCarregando] = useState(false);

    async function entrar(event) {
        event.preventDefault();
        setErro('');
        setCarregando(true);

        try {
            const data = await api('/auth/login', {
                method: 'POST',
                body: JSON.stringify({ email, senha })
            });

            setToken(data.token);
            localStorage.setItem('inventario_usuario', JSON.stringify(data.usuario));
            onLogin(data.usuario);

        } catch (error) {
            setErro(error.message);

        } finally {
            setCarregando(false);
        }
    }

    return (
        <div className="login-page">
            <form className="login-card" onSubmit={entrar}>
                <div className="brand-mark">
                    <ShieldCheck size={34} />
                </div>
                <h1>Inventário Patrimonial</h1>
                <p>Acesse o sistema para gerenciar os ativos.</p>

                <label>
                    E-mail
                    <input value={email} onChange={e => setEmail(e.target.value)} />
                </label>

                <label>
                    Senha
                    <input
                        type="password"
                        value={senha}
                        onChange={e => setSenha(e.target.value)}
                    />
                </label>

                {erro && <div className="alert error">{erro}</div>}

                <button className="primary full" disabled={carregando}>
                    {carregando ? 'Entrando...' : 'Entrar'}
                </button>
            </form>
        </div>
    );
}

function App() {
    const [usuario, setUsuario] = useState(() => {
        const value = localStorage.getItem('inventario_usuario');
        return value ? JSON.parse(value) : null;
    });

    if (!getToken() || !usuario) {
        return <Login onLogin={setUsuario} />;
    }

    return <Sistema usuario={usuario} onLogout={() => {
        clearToken();
        setUsuario(null);
    }} />;
}

function Sistema({ usuario, onLogout }) {
    const [ativos, setAtivos] = useState([]);
    const [dashboard, setDashboard] = useState(null);
    const [campus, setCampus] = useState([]);
    const [predios, setPredios] = useState([]);
    const [setores, setSetores] = useState([]);
    const [categorias, setCategorias] = useState([]);
    const [busca, setBusca] = useState('');
    const [status, setStatus] = useState('');
    const [form, setForm] = useState(formVazio);
    const [editandoSerial, setEditandoSerial] = useState(null);
    const [mensagem, setMensagem] = useState('');
    const [erro, setErro] = useState('');
    const podeEditar = ['ADMIN', 'GESTOR'].includes(usuario.perfil);

    async function carregarTudo() {
        setErro('');

        try {
            const [lista, dash, campusData, categoriasData] = await Promise.all([
                api('/ativos'),
                api('/dashboard'),
                api('/cadastros/campus'),
                api('/cadastros/categorias')
            ]);

            setAtivos(lista);
            setDashboard(dash);
            setCampus(campusData);
            setCategorias(categoriasData);

        } catch (error) {
            setErro(error.message);
        }
    }

    useEffect(() => {
        carregarTudo();
    }, []);

    useEffect(() => {
        if (!form.campus_id) {
            setPredios([]);
            return;
        }

        api(`/cadastros/predios?campus_id=${form.campus_id}`)
            .then(setPredios)
            .catch(() => setPredios([]));

    }, [form.campus_id]);

    useEffect(() => {
        if (!form.predio_id) {
            setSetores([]);
            return;
        }

        api(`/cadastros/setores?predio_id=${form.predio_id}`)
            .then(setSetores)
            .catch(() => setSetores([]));

    }, [form.predio_id]);

    const filtrados = useMemo(() => {
        const termo = busca.trim().toLowerCase();

        return ativos.filter(ativo => {
            const combinaBusca = !termo || [
                ativo.serial_number,
                ativo.patrimonio,
                ativo.tipo,
                ativo.marca,
                ativo.modelo,
                ativo.setor,
                ativo.predio,
                ativo.campus
            ].some(valor => String(valor || '').toLowerCase().includes(termo));

            const combinaStatus = !status || ativo.status_ativo === status;

            return combinaBusca && combinaStatus;
        });
    }, [ativos, busca, status]);

    function limparForm() {
        setForm(formVazio);
        setEditandoSerial(null);
    }

    async function editar(ativo) {
        setEditandoSerial(ativo.serial_number);
        setForm({
            serial_number: ativo.serial_number,
            patrimonio: ativo.patrimonio,
            tipo: ativo.tipo,
            marca: ativo.marca,
            modelo: ativo.modelo,
            status_ativo: ativo.status_ativo,
            campus_id: String(ativo.campus_id),
            predio_id: String(ativo.predio_id),
            setor_id: String(ativo.setor_id),
            categoria_id: ativo.categoria_id ? String(ativo.categoria_id) : ''
        });

        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    async function salvar(event) {
        event.preventDefault();
        setErro('');
        setMensagem('');

        const payload = {
            serial_number: form.serial_number.trim(),
            patrimonio: form.patrimonio.trim(),
            tipo: form.tipo.trim(),
            marca: form.marca.trim(),
            modelo: form.modelo.trim(),
            status_ativo: form.status_ativo,
            setor_id: Number(form.setor_id),
            categoria_id: form.categoria_id ? Number(form.categoria_id) : null
        };

        try {
            if (editandoSerial) {
                await api(`/ativos/${encodeURIComponent(editandoSerial)}`, {
                    method: 'PUT',
                    body: JSON.stringify(payload)
                });
                setMensagem('Ativo atualizado com sucesso.');

            } else {
                await api('/ativos', {
                    method: 'POST',
                    body: JSON.stringify(payload)
                });
                setMensagem('Ativo cadastrado com sucesso.');
            }

            limparForm();
            await carregarTudo();

        } catch (error) {
            setErro(error.message);
        }
    }

    async function baixar(ativo) {
        const motivo = window.prompt(
            `Informe o motivo da baixa de ${ativo.patrimonio}:`
        );

        if (!motivo) {
            return;
        }

        try {
            await api(`/ativos/${encodeURIComponent(ativo.serial_number)}`, {
                method: 'DELETE',
                body: JSON.stringify({ motivo })
            });

            setMensagem('Baixa registrada com sucesso.');
            await carregarTudo();

        } catch (error) {
            setErro(error.message);
        }
    }

    async function exportarCsv() {
        try {
            const response = await fetch(`${API_URL}/ativos/export/csv`, {
                headers: {
                    Authorization: `Bearer ${getToken()}`
                }
            });

            if (!response.ok) {
                throw new Error('Não foi possível exportar o CSV.');
            }

            const blob = await response.blob();
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');

            link.href = url;
            link.download = 'inventario.csv';
            link.click();

            URL.revokeObjectURL(url);

        } catch (error) {
            setErro(error.message);
        }
    }

    return (
        <div className="app-shell">
            <aside className="sidebar">
                <div className="brand">
                    <Boxes size={30} />
                    <div>
                        <strong>Inventário</strong>
                        <span>Patrimonial</span>
                    </div>
                </div>

                <div className="sidebar-user">
                    <span>{usuario.nome}</span>
                    <small>{usuario.perfil}</small>
                </div>

                <button className="ghost sidebar-button" onClick={onLogout}>
                    <LogOut size={17} />
                    Sair
                </button>
            </aside>

            <main className="content">
                <header className="topbar">
                    <div>
                        <h1>Gestão de ativos</h1>
                        <p>Controle, localização e rastreabilidade do patrimônio.</p>
                    </div>

                    <button className="secondary" onClick={carregarTudo}>
                        <RefreshCcw size={17} />
                        Atualizar
                    </button>
                </header>

                {erro && <div className="alert error">{erro}</div>}
                {mensagem && <div className="alert success">{mensagem}</div>}

                <section className="cards">
                    <Card titulo="Total cadastrado" valor={dashboard?.totais?.total ?? 0} />
                    <Card titulo="Ativos" valor={dashboard?.totais?.ativos ?? 0} />
                    <Card titulo="Disponíveis" valor={dashboard?.totais?.disponiveis ?? 0} />
                    <Card titulo="Em uso" valor={dashboard?.totais?.em_uso ?? 0} />
                    <Card titulo="Manutenção" valor={dashboard?.totais?.manutencao ?? 0} />
                    <Card titulo="Baixados" valor={dashboard?.totais?.baixados ?? 0} />
                </section>

                {podeEditar && (
                    <section className="panel">
                        <div className="panel-title">
                            <div>
                                <h2>{editandoSerial ? 'Editar ativo' : 'Cadastrar ativo'}</h2>
                                <p>
                                    O ativo é relacionado ao setor; prédio e campus são obtidos pelas chaves estrangeiras.
                                </p>
                            </div>
                            {editandoSerial && (
                                <button className="ghost" onClick={limparForm}>
                                    Cancelar edição
                                </button>
                            )}
                        </div>

                        <form className="asset-form" onSubmit={salvar}>
                            <label>
                                Serial
                                <input
                                    required
                                    disabled={Boolean(editandoSerial)}
                                    value={form.serial_number}
                                    onChange={e => setForm({ ...form, serial_number: e.target.value })}
                                />
                            </label>

                            <label>
                                Patrimônio
                                <input
                                    required
                                    value={form.patrimonio}
                                    onChange={e => setForm({ ...form, patrimonio: e.target.value })}
                                />
                            </label>

                            <label>
                                Tipo
                                <input
                                    required
                                    value={form.tipo}
                                    onChange={e => setForm({ ...form, tipo: e.target.value })}
                                />
                            </label>

                            <label>
                                Marca
                                <input
                                    required
                                    value={form.marca}
                                    onChange={e => setForm({ ...form, marca: e.target.value })}
                                />
                            </label>

                            <label>
                                Modelo
                                <input
                                    required
                                    value={form.modelo}
                                    onChange={e => setForm({ ...form, modelo: e.target.value })}
                                />
                            </label>

                            <label>
                                Status
                                <select
                                    value={form.status_ativo}
                                    onChange={e => setForm({ ...form, status_ativo: e.target.value })}
                                >
                                    <option>Disponivel</option>
                                    <option>Em uso</option>
                                    <option>Manutencao</option>
                                </select>
                            </label>

                            <label>
                                Campus
                                <select
                                    required
                                    value={form.campus_id}
                                    onChange={e => setForm({
                                        ...form,
                                        campus_id: e.target.value,
                                        predio_id: '',
                                        setor_id: ''
                                    })}
                                >
                                    <option value="">Selecione</option>
                                    {campus.map(item => (
                                        <option key={item.id} value={item.id}>
                                            {item.nome}
                                        </option>
                                    ))}
                                </select>
                            </label>

                            <label>
                                Prédio
                                <select
                                    required
                                    value={form.predio_id}
                                    onChange={e => setForm({
                                        ...form,
                                        predio_id: e.target.value,
                                        setor_id: ''
                                    })}
                                >
                                    <option value="">Selecione</option>
                                    {predios.map(item => (
                                        <option key={item.id} value={item.id}>
                                            {item.nome}
                                        </option>
                                    ))}
                                </select>
                            </label>

                            <label>
                                Setor
                                <select
                                    required
                                    value={form.setor_id}
                                    onChange={e => setForm({ ...form, setor_id: e.target.value })}
                                >
                                    <option value="">Selecione</option>
                                    {setores.map(item => (
                                        <option key={item.id} value={item.id}>
                                            {item.nome}
                                        </option>
                                    ))}
                                </select>
                            </label>

                            <label>
                                Categoria
                                <select
                                    value={form.categoria_id}
                                    onChange={e => setForm({ ...form, categoria_id: e.target.value })}
                                >
                                    <option value="">Sem categoria</option>
                                    {categorias.map(item => (
                                        <option key={item.id} value={item.id}>
                                            {item.nome}
                                        </option>
                                    ))}
                                </select>
                            </label>

                            <button className="primary form-submit">
                                <Plus size={17} />
                                {editandoSerial ? 'Salvar alterações' : 'Cadastrar ativo'}
                            </button>
                        </form>
                    </section>
                )}

                <section className="panel">
                    <div className="panel-title table-heading">
                        <div>
                            <h2>Ativos cadastrados</h2>
                            <p>{filtrados.length} registro(s) exibido(s)</p>
                        </div>

                        <button className="secondary" onClick={exportarCsv}>
                            <Download size={17} />
                            Exportar CSV
                        </button>
                    </div>

                    <div className="filters">
                        <div className="search-box">
                            <Search size={18} />
                            <input
                                placeholder="Buscar patrimônio, serial, marca, modelo..."
                                value={busca}
                                onChange={e => setBusca(e.target.value)}
                            />
                        </div>

                        <select value={status} onChange={e => setStatus(e.target.value)}>
                            <option value="">Todos os status</option>
                            <option value="Disponivel">Disponível</option>
                            <option value="Em uso">Em uso</option>
                            <option value="Manutencao">Manutenção</option>
                        </select>
                    </div>

                    <div className="table-wrap">
                        <table>
                            <thead>
                                <tr>
                                    <th>Patrimônio</th>
                                    <th>Equipamento</th>
                                    <th>Localização</th>
                                    <th>Status</th>
                                    {podeEditar && <th>Ações</th>}
                                </tr>
                            </thead>
                            <tbody>
                                {filtrados.map(ativo => (
                                    <tr key={ativo.serial_number}>
                                        <td>
                                            <strong>{ativo.patrimonio}</strong>
                                            <small>{ativo.serial_number}</small>
                                        </td>
                                        <td>
                                            {ativo.tipo} — {ativo.marca} {ativo.modelo}
                                            <small>{ativo.categoria || 'Sem categoria'}</small>
                                        </td>
                                        <td>
                                            <div className="location">
                                                <Building2 size={16} />
                                                <span>
                                                    {ativo.campus} / {ativo.predio} / {ativo.setor}
                                                </span>
                                            </div>
                                        </td>
                                        <td>
                                            <span className={`badge ${String(ativo.status_ativo).replace(/\s/g, '-').toLowerCase()}`}>
                                                {ativo.status_ativo}
                                            </span>
                                        </td>
                                        {podeEditar && (
                                            <td>
                                                <div className="actions">
                                                    <button
                                                        className="icon-button"
                                                        title="Editar"
                                                        onClick={() => editar(ativo)}
                                                    >
                                                        <Pencil size={16} />
                                                    </button>
                                                    <button
                                                        className="icon-button danger"
                                                        title="Dar baixa"
                                                        onClick={() => baixar(ativo)}
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        )}
                                    </tr>
                                ))}

                                {!filtrados.length && (
                                    <tr>
                                        <td colSpan={podeEditar ? 5 : 4} className="empty">
                                            Nenhum ativo encontrado.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </section>
            </main>
        </div>
    );
}

function Card({ titulo, valor }) {
    return (
        <div className="metric-card">
            <span>{titulo}</span>
            <strong>{valor}</strong>
        </div>
    );
}

export default App;
