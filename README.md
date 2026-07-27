# MVP Sistemas Commitjr

Este repositório contém um projeto de treinamento da Commitjr: um MVP de e-commerce construído com **Django** no backend e **React** no frontend.

O objetivo é demonstrar, de forma prática, como montar uma aplicação web com autenticação, catálogo de produtos, carrinho, pedidos, promoções e uma área de vendedor. O projeto usa **SQLite** para persistência local e **JWT** para autenticação.

## Proposta do projeto

A aplicação foi pensada como um exercício de formação para o time de Sistemas da Commitjr. Ela simula um fluxo simples de marketplace/e-commerce com:

- cadastro e login de usuários;
- listagem e detalhe de produtos;
- carrinho de compras;
- finalização e acompanhamento de pedidos;
- painel para vendedor;
- cupons e promoções;
- upload e exibição de imagens de produtos.

## Estrutura geral

- `backend/`: API em Django com Django REST Framework.
- `frontend/`: interface em React com Vite.
- `backend/ecommerce/db.sqlite3`: banco local já incluído no projeto.
- `backend/ecommerce/media/`: arquivos enviados, como imagens de produtos.

## Requisitos

- Python 3.12+;
- Node.js 18+;
- npm;
- PowerShell ou terminal equivalente no Windows.

## Como rodar o backend

1. Abra um terminal e entre na pasta do backend:

	```powershell
	cd c:\Users\joaov\Downloads\mvp_sistemas_commitjr\backend\ecommerce
	```

2. Ative o ambiente virtual existente no projeto:

	```powershell
	..\venv\Scripts\Activate.ps1
	```

	Se estiver usando Prompt de Comando, o equivalente é:

	```bat
	..\venv\Scripts\activate.bat
	```

3. Aplique as migrações, caso queira recriar o banco local:

	```powershell
	python manage.py migrate
	```

4. Inicie o servidor Django:

	```powershell
	python manage.py runserver
	```

5. A API ficará disponível em:

	- `http://127.0.0.1:8000/`
	- `http://127.0.0.1:8000/api/auth/`
	- `http://127.0.0.1:8000/api/catalog/`
	- `http://127.0.0.1:8000/api/orders/`
	- `http://127.0.0.1:8000/api/promotions/`

## Como rodar o frontend

1. Abra outro terminal e entre na pasta do frontend:

	```powershell
	cd c:\Users\joaov\Downloads\mvp_sistemas_commitjr\frontend
	```

2. Instale as dependências:

	```powershell
	npm install
	```

3. Suba a aplicação React:

	```powershell
	npm run dev
	```

4. A interface ficará disponível em:

	- `http://localhost:5173/`

## Fluxo de uso

1. Inicie primeiro o backend e depois o frontend.
2. Abra a página inicial do React.
3. Faça login ou cadastro para acessar as rotas protegidas.
4. Navegue pelos produtos, adicione itens ao carrinho e acompanhe pedidos.
5. Use a área de vendedor para cadastrar ou gerenciar produtos, quando aplicável.

## Tecnologias utilizadas

- Django
- Django REST Framework
- SimpleJWT
- django-cors-headers
- React
- React Router
- Vite

## Observações

- O projeto está configurado para desenvolvimento local.
- As imagens de produtos são servidas pela pasta `media/` quando o `DEBUG` está ativo.
- O frontend está configurado para consumir a API local em `localhost`.
