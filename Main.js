const readline = require('readline');
const crypto = require('crypto');

function scanf(formato) {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    return new Promise(resolve => {
        rl.question(formato, resposta => {
            rl.close();
            resolve(resposta.trim());
        });
    });
}

// Variavel de login
let usuarioLogado = null;

// Dados dos usuários (em memória)
const dadosUsuarios = [
    { email: 'admin', senha: '6b86b273ff34fce19d6b804eff5a3f5747ada4eaa22f1d49c01e52ddb7875b4b', nome: 'Admin', permissao: true, dataCriacao: new Date(), ultimaDataLogin: new Date(), ativo: true },
    { email: 'teste@gmail.com', senha: '6b86b273ff34fce19d6b804eff5a3f5747ada4eaa22f1d49c01e52ddb7875b4b', nome: 'Admin', permissao: false, dataCriacao: new Date(), ultimaDataLogin: new Date(), ativo: true },
    // Adicione mais usuários conforme necessidade
];

// Função para verificar senha
async function verificarSenha(senhaDigitada, hashArmazenado) {
    const senhaHash = await criarHash(senhaDigitada);
    return senhaHash === hashArmazenado;
}

// Função para verificar as credenciais do usuário ------------------------------------------------------------------------
async function fazerLogin(email, senha) {
    var contagem = 0;

    while (contagem < 3) {
        
        if (email === undefined && senha === undefined) {
            email = await scanf("Digite seu email: ")
            senha = await scanf("Digite sua senha: ")
        }

        const usuario = dadosUsuarios.find(u => u.email === email);

        if (usuario && await verificarSenha(senha, usuario.senha)) {
            if (usuario.ativo !== false) {
                // Login bem-sucedido
                usuario.ultimaDataLogin = new Date();
                usuarioLogado = usuario;
                console.log(`Bem-vindo, ${usuario.nome}!`);
                contagem = 4;
            } else {
                console.log("Usuario inativo!")
                contagem = 4;
            }
        } else {
            // Login falhou
            console.log('E-mail ou senha invalidos, tente novamente.\n');
            contagem++;
        }

    }

    if (contagem === 3) {
        console.log("Erro de login! tente novamente mais tarde.")
    }
}

// Função que verifica se o e-mail já está em uso
function emailEstaEmUso(email) {
    return dadosUsuarios.some(usuario => usuario.email === email);
}

// Função que cria um hash para a senha
async function senhaSegura() {
    let senha;
    do {
        senha = await scanf("A senha deve ter no mínimo 8 caracteres e conter letras maiúsculas, minúsculas, números e caracteres especiais. ");
    } while (senha.length < 8 || !(/[A-Z]/.test(senha)) || !(/[a-z]/.test(senha)) || !(/\d/.test(senha)) || !(/[^A-Za-z0-9]/.test(senha)));

    return senha;
}

async function criarHash(dados) {
    const encoder = new TextEncoder();
    const data = encoder.encode(dados);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(byte => byte.toString(16).padStart(2, '0')).join('');
    return hashHex;
}

// Validar o email
async function validarEmail() {
    let email;
    do {
        email = await scanf("Digite um email valido para o usuario: ")
    } while (!(/^[^\s@]+@[^\s@]+\.[^\s@]+$/).test(email))

    return email;
}

// Função para registrar usuarios -----------------------------------------------------------------------------------------
async function registrarUsuario(nomeTeste, emailTeste, senhaTeste) {
    const novoUsuario = {};

    if (nomeTeste === undefined) {
        novoUsuario.nome = await scanf("Digite o nome: ");
        novoUsuario.email = await validarEmail();
        senha = await senhaSegura();
        novoUsuario.senha = await criarHash(senha);
    } else {
        novoUsuario.nome = nomeTeste;
        novoUsuario.email = emailTeste
        novoUsuario.senha = await criarHash(senhaTeste);
    }

    novoUsuario.ativo = true;
    novoUsuario.dataCriacao = new Date();
    novoUsuario.ultimaDataLogin = new Date();

    if (usuarioLogado) {

        const respostaPermissao = await scanf("O usuário terá permissão? (true ou false): ");
        const permissao = respostaPermissao.toLowerCase() === 'true';
        novoUsuario.permissao = permissao;

    } else {
        novoUsuario.permissao = false;
    }

    // Verifica o e-mail, está em uso?
    if (emailEstaEmUso(novoUsuario.email)) {
        console.log("E-mail já está em uso. Por favor, escolha outro e-mail.");
        return;
    }

    dadosUsuarios.push(novoUsuario);

    console.log('Novo usuário registrado com sucesso!');
}

// Função Listar usuarios --------------------------------------------------------------------------------------------------
function listarUsuarios() {
    console.log('Lista de Usuários:\n');
    dadosUsuarios.forEach(usuario => {
        console.log(`Nome: ${usuario.nome}, Email: ${usuario.email}, Senha: ${usuario.senha}, Data Criação: ${usuario.dataCriacao.toLocaleString()}, Ultimo login: ${usuario.ultimaDataLogin.toLocaleString()}, Ativo: ${usuario.ativo}, Permissão: ${usuario.permissao}`);
    });
}

// Função para alterar o nome de usuário logado ----------------------------------------------------------------------------
async function alterarNomeUsuario(email, novoNome, novoEmail) {

    if (usuarioLogado.permissao === true) {
        if (email === undefined) {
            email = await scanf("Digite o email do usuário que voce quer alterar, se for o seu próprio usuário somente digitar o seu e-mail: ");
        }
    } else {
        email = usuarioLogado.email;
    }

    const indiceUsuario = dadosUsuarios.findIndex(u => u.email === email);


    if (indiceUsuario !== -1) {
        console.log("Para alterar algo somente digitar, se não tiver inteção apenas aperte enter que passara para a próxima.")

        if (novoEmail === undefined) {
            novoNome = await scanf(`Digite o novo nome para ${dadosUsuarios[indiceUsuario].nome}: `);
            novoEmail = await scanf(`Digite o novo e-mail para ${dadosUsuarios[indiceUsuario].email}: `);
        }

        dadosUsuarios[indiceUsuario].nome = novoNome !== "" ? novoNome : dadosUsuarios[indiceUsuario].nome;

        dadosUsuarios[indiceUsuario].email = novoEmail !== "" ? novoEmail : dadosUsuarios[indiceUsuario].email;
        console.log('Usuário alterado com sucesso!');
    } else {
        console.log('Usuário não encontrado na array dadosUsuarios.');
    }
}

// Função para excluir um usuário -------------------------------------------------------------------------------------------
async function excluirUsuario(email) {

    if (usuarioLogado.permissao === true) {
        if (email === undefined) {
            email = await scanf("Digite o usuario que voce quer excluir: ");
        }
    } else {
        email = usuarioLogado.email;
    }

    const indiceUsuario = dadosUsuarios.findIndex(u => u.email === email);

    if (indiceUsuario !== -1) {
        // Remove o usuário da array dadosUsuarios
        dadosUsuarios.splice(indiceUsuario, 1);
        console.log(`Usuário ${email} excluído com sucesso.`);
        if (usuarioLogado.permissao != true) {
            fazerLogout()
        }
    } else {
        console.log(`Usuário ${email} não encontrado na array dadosUsuarios.`);
    }

}

// Função para ativar e desativar usuário ---------------------------------------------------------------------------------
async function ativarUsuario(email) {

    if (email === undefined) {
        email = await scanf("Digite o email do usuario: ")
    }
    const usuario = dadosUsuarios.find(u => u.email === email);

    if (usuario && usuario.ativo == false) {
        usuario.ativo = true;
        console.log(`Usuário ${email} ativado com sucesso.`);
    } else if (usuario && usuario.ativo == true) {
        usuario.ativo = false;
        console.log(`Usuário ${email} desativado com sucesso.`);
    }
    else {
        console.log(`Usuário ${email} não encontrado.`);
    }
}

// Função para fazer logout -------------------------------------------------------------------------------------------------
function fazerLogout() {
    // Logout
    usuarioLogado = null;
    console.log('Logout realizado com sucesso.');
}

// Função principal assíncrona ===============================================================================================
async function main() {
    respostaUsuario = 0;

    while (respostaUsuario !== 10) {
        if (usuarioLogado === null) {
            console.log("\nPara realizar login, digite 1");
            console.log("Registrar um novo usuário, digite 2");
        } else {
            if (usuarioLogado.permissao) {
                console.log("\nRegistrar um novo usuário, digite 2");
                console.log("Para desativar ou ativar algum usuario digite 3")
                console.log("Listar os usuários, digite 4");
                console.log("Alterar o usuário, digite 5");
                console.log("Excluir algum usuario, digite 6");
                console.log("Fazer logout, digite 8");
                console.log("Para sair, digite 10");
            } else {
                console.log("\nListar os usuários, digite 4");
                console.log("Alterar o usuário, digite 5");
                console.log("Deletar a sua conta, digite 6");
                console.log("Fazer logout, digite 8");
                console.log("Para sair, digite 10");
            }
        }

        respostaUsuario = Number(await scanf("Digite um número: "));

        switch (respostaUsuario) {
            case 1:

                if (usuarioLogado === null) {
                    await fazerLogin();
                }
                break;

            case 2:

                if (usuarioLogado != null) {
                    if (usuarioLogado.permissao === true) {
                        await registrarUsuario();
                    } else {
                        console.log("Usuário logado, não permitido registrar usuário.");
                    }
                } else {
                    await registrarUsuario();
                }
                break;

            case 3:

                if (usuarioLogado !== null) {
                    if (usuarioLogado.permissao === true) {
                        await ativarUsuario();
                    } else {
                        console.log("Usuário não tem permissão para essa alteração.");
                    }
                } else {
                    console.log("Usuário não logado.");
                }
                break;

            case 4:

                if (usuarioLogado === null) {
                    console.log("Usuário não logado, não permitido listar usuários.");
                } else {
                    listarUsuarios();
                }
                break;

            case 5:

                if (usuarioLogado === null) {
                    console.log("Usuário não logado, não permitido alterar.");
                } else {
                    await alterarNomeUsuario();
                }
                break;

            case 6:

                if (usuarioLogado === null) {
                    console.log("Usuário não logado, não permitido alterações.");
                } else {
                    await excluirUsuario();
                }
                break

            case 8:

                usuarioLogado === null ? console.log("Primeiro log.") : fazerLogout();
                break;

            default:
                console.log('Opção inválida. Tente novamente.');
        }
    }
    console.log('Saindo...');
}

main();
module.exports = { fazerLogin, registrarUsuario, listarUsuarios, ativarUsuario, fazerLogout, alterarNomeUsuario, main, excluirUsuario };