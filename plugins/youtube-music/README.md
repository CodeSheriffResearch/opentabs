# YouTube Music

OpenTabs plugin for YouTube Music — gives AI agents access to YouTube Music through your authenticated browser session.

## Install

```bash
opentabs plugin install youtube-music
```

Or install globally via npm:

```bash
npm install -g @opentabs-dev/opentabs-plugin-youtube-music
```

## Setup

1. Open [music.youtube.com](https://music.youtube.com) in Chrome and log in
2. Open the OpenTabs side panel — the YouTube Music plugin should appear as **ready**

## Tools (15)

### Search (2)

| Tool | Description | Type |
|---|---|---|
| `search` | Search YouTube Music for songs, albums, artists, playlists, or videos | Write |
| `get_search_suggestions` | Get autocomplete suggestions for a search query | Read |

### Browse (1)

| Tool | Description | Type |
|---|---|---|
| `get_home` | Get personalized home feed with recommended music | Read |

### Library (1)

| Tool | Description | Type |
|---|---|---|
| `get_library` | Get the user's music library overview | Read |

### Songs (3)

| Tool | Description | Type |
|---|---|---|
| `get_song` | Get detailed information about a song | Read |
| `like_song` | Like a song on YouTube Music | Write |
| `unlike_song` | Remove like from a song | Write |

### Artists (1)

| Tool | Description | Type |
|---|---|---|
| `get_artist` | Get artist page with top songs and discography | Read |

### Albums (1)

| Tool | Description | Type |
|---|---|---|
| `get_album` | Get album details and track listing | Read |

### Playlists (6)

| Tool | Description | Type |
|---|---|---|
| `list_playlists` | List user's playlists | Read |
| `get_playlist` | Get playlist tracks | Read |
| `create_playlist` | Create a new playlist | Write |
| `delete_playlist` | Delete a playlist | Write |
| `add_to_playlist` | Add a song to a playlist | Write |
| `remove_from_playlist` | Remove a song from a playlist | Write |

## How It Works

This plugin runs inside your YouTube Music tab through the [OpenTabs](https://opentabs.dev) Chrome extension. It uses your existing browser session — no API tokens or OAuth apps required. All operations happen as you, with your permissions.

## License

MIT
