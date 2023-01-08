export { fakeBackend }

function fakeBackend() {
    let users = [
        {
            id: 1,
            username: 'Admin',
            password: 'admin',
            firstName: 'Toto',
            lastName: 'Titus'
        }
    ]

    let realFetch = window.fetch

    window.fetch = function (url, options) {
        return new Promise((resolve, reject) => {
            // Ajouter un délai d'attente pour simuler l'appel à l'API du serveur.
            setTimeout(handleRoute, 500)

            function handleRoute() {
                switch (true) {
                    case url.endsWith('/users/authenticate') && options.method === 'POST':
                        return login()
                    case url.endsWith('/users') && options.method === 'GET':
                        return getUsers()
                    default:
                        // Passe par toutes les demandes non traitées ci-dessus
                        return realFetch(url, options)
                            .then(response => resolve(response))
                            .catch(error => reject(error))
                }
            }

            function login() {
                const { username, password } = body()
                const user = users.find(x => x.username === username && x.password === password)

                if (!user)
                    return error('Le nom d\'utilisateur ou le mot de passe est incorrect')

                return ok({
                    id: user.id,
                    username: user.username,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    token: 'fake-jwt-token'
                })
            }

            function getUsers() {
                if (!isAuthenticated())
                    return unauthorized()

                return ok(users)
            }

            function ok(body) {
                resolve({
                    ok: true,
                    text: () => Promise.resolve(JSON.stringify(body))
                })
            }

            function unauthorized() {
                resolve({
                    status: 401,
                    text: () => Promise.resolve(JSON.stringify({ message: 'Non autorisé' }))
                })
            }

            function error(message) {
                resolve({
                    status: 400,
                    text: () => Promise.resolve(JSON.stringify({ message }))
                })
            }
            function isAuthenticated() {
                return options.headers['Authorization'] === 'Bearer fake-jwt-token';
            }

            function body() {
                return options.body && JSON.parse(options.body)
            }
        })
    }
}