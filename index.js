const USER_AGENT = "VRChat User Fetcher/1.0.0 (email goes here)";

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const userId = url.searchParams.get("user_id");

    if (!userId || !/^usr_[a-f0-9-]{36}$/.test(userId)) {
      return new Response(JSON.stringify({ error: "Invalid or missing user_id" }), { status: 400 });
    }

    try {
      const res = await fetch(`https://api.vrchat.cloud/api/1/users/${userId}`, {
        headers: {
          "Cookie": `auth=${env.VRCHAT_AUTH_COOKIE}`,
          "User-Agent": USER_AGENT,
        },
      });

      if (!res.ok) {
        const errText = await res.text();
        return new Response(JSON.stringify({ error: "Failed to fetch user", details: errText }), { status: res.status });
      }

      const user = await res.json();

      return new Response(JSON.stringify({
        displayName: user.displayName,
        avatar: user.profilePicOverride || user.currentAvatarImageUrl,
        profileUrl: `https://vrchat.com/home/user/${user.id}`,
        timestamp: Math.floor(Date.now() / 1000),
      }), {
        headers: { "Content-Type": "application/json" },
      });

    } catch (err) {
      return new Response(JSON.stringify({ error: "Worker fetch failed", details: err.message }), { status: 500 });
    }
  },
};
