(async () => {
  try {
    const base = "http://localhost:3001";
    const loginRes = await fetch(base + "/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "testadmin@example.com",
        senha: "P4ssword1",
      }),
    });
    const loginJson = await loginRes.json();
    console.log("login status", loginRes.status, loginJson);
    if (!loginRes.ok) {
      process.exit(1);
    }
    const token = loginJson.token;
    const upd = await fetch(base + "/api/profile/update-avatar", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ avatar: "/assets/avatars/avatar1.svg" }),
    });
    const updJson = await upd.json();
    console.log("update-avatar status", upd.status, updJson);
  } catch (e) {
    console.error("error", e);
    process.exit(2);
  }
})();
