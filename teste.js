// testeLogin.js
const { fazerLogin, registrarUsuario, listarUsuarios, ativarUsuario, alterarNomeUsuario, fazerLogout, excluirUsuario, main } = require('./Main.js');

async function runTests() {
    // Testes registro
    console.log("\n------TESTES DO PROJETO------")
    console.log('\nTeste 1: Registrar bem-sucedido');
    await registrarUsuario('gustavo', 'gustavo@gmail.com', 'Gustavo22@');

    console.log('Teste 2: E-mail já registrado');
    await registrarUsuario('gustavo', 'admin@gmail.com', 'Gustavo22@');

    // Testes login
    console.log('\nTeste 1: Login bem-sucedido');
    await fazerLogin('admin', '1');

    console.log('Teste 2: Três tentativas de login com falha');
    await fazerLogin('emailInvalido', 'senhaInvalida');
    await fazerLogin('emailInvalido', 'senhaInvalida');
    await fazerLogin('emailInvalido', 'senhaInvalida');

    console.log('Teste 3: Tentativa de login após três falhas');
    await fazerLogin('emailInvalido', 'senhaInvalida');

    console.log('Teste 4: Login com e-mail/senha inválidos');
    await fazerLogin('usuarioteste', 'senhaInvalida');

    // Testes de listar
    console.log('\nTestes 1: Listar usuarios');
    listarUsuarios();

    // Teste de ativar
    console.log('\nTeste 1: Ativar usuario');
    await ativarUsuario('teste@gmail.com')

    // Teste alterar usuario
    listarUsuarios()
    console.log('\nTeste 1: Alterar usuario sendo ADM');
    await alterarNomeUsuario("admin", "", "")
    fazerLogout()

    await fazerLogin('admin@gmail.com', 'Gustavo22@');

    console.log('Teste 2: Alterar usuario sem permissão, alterando o seu proprio usuario nao sendo permitido escolher');
    await alterarNomeUsuario("", "gustavinho2", "admin@gmail.com")

    // Teste excluir usuario
    console.log('\nTeste 1: Excluindo a conta do usuario');
    await excluirUsuario();

    await fazerLogin('admin', '1')

    listarUsuarios()
    console.log('\nTeste 2: Excluindo um usuario sendo ADM, teste com usuario inexistente.');
    await excluirUsuario('teste22@gmail.com')

    console.log('\nTeste 3: Excluindo usuario com ADM, email valido')
    await excluirUsuario("admin@gmail.com")

    fazerLogout()
    console.log("\n___Testes finalizados___");
    process.exit();
}

// Executa os casos de teste
runTests();
