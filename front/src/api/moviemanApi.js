/**
 * Movie-Man API client for watchlist and watched (Azure Table Storage backend)
 * Requires getToken() that returns a Promise<string> (Bearer token)
 */
const getApiBase = () =>
  process.env.REACT_APP_API_URL || 'http://localhost:7071/api';

export async function fetchWatchlist(getToken) {
  const token = await getToken();
  const res = await fetch(`${getApiBase()}/watchlist`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function addToWatchlist(movie, getToken) {
  const token = await getToken();
  const res = await fetch(`${getApiBase()}/watchlist`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(movie),
  });
  if (!res.ok) throw new Error(await res.text());
}

export async function removeFromWatchlist(movieKey, getToken) {
  const token = await getToken();
  const res = await fetch(
    `${getApiBase()}/watchlist?movieKey=${encodeURIComponent(movieKey)}`,
    {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  if (!res.ok && res.status !== 204) throw new Error(await res.text());
}

export async function fetchWatched(getToken) {
  const token = await getToken();
  const res = await fetch(`${getApiBase()}/watched`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function addToWatched(entry, getToken) {
  const token = await getToken();
  const res = await fetch(`${getApiBase()}/watched`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(entry),
  });
  if (!res.ok) throw new Error(await res.text());
}

export async function removeFromWatched(movieKey, getToken) {
  const token = await getToken();
  const res = await fetch(
    `${getApiBase()}/watched?movieKey=${encodeURIComponent(movieKey)}`,
    {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  if (!res.ok && res.status !== 204) throw new Error(await res.text());
}

export async function reorderWatched(movieKey, direction, getToken) {
  const token = await getToken();
  const res = await fetch(`${getApiBase()}/watched`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ movieKey, direction }),
  });
  if (!res.ok) throw new Error(await res.text());
}

export async function fetchUsers(getToken) {
  const token = await getToken();
  const res = await fetch(`${getApiBase()}/users`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function registerUser(getToken) {
  const token = await getToken();
  const res = await fetch(`${getApiBase()}/users`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: '{}',
  });
  if (!res.ok) throw new Error(await res.text());
}
