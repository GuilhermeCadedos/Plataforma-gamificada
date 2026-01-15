(async () => {
  try {
    const register = await fetch("http://localhost:3001/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nome: "Tester",
        email: "tester2@example.com",
        senha: "Password1",
      }),
    });
    console.log("register status", register.status);
    console.log(await register.text());

    const login = await fetch("http://localhost:3001/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "tester2@example.com",
        senha: "Password1",
      }),
    });
    console.log("login status", login.status);
    const lj = await login.json();
    console.log("login json", lj);
  } catch (e) {
    console.error(e);
  }
})();
