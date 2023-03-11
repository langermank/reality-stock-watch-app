## Routes structure

#### Admin
```
/admin/show
/admin/show/{id}
/admin/show/{id}/series
/admin/show/{id}/series/{id}
/admin/show/{id}/series/{id}/game
/admin/show/{id}/series/{id}/season
/admin/show/{id}/series/{id}/season/{id}

/admin/show/{id}/series/{id}/game/game-season (redirect)

/admin/show/{id}/series/{id}/season/{id}/participant
/admin/show/{id}/series/{id}/season/{id}/game-season
/admin
	/show/{id}
	/series/{id}
	/season/{id}
	/game-season/{id}
	/cycles/{id}
	/panel


/admin/show
/admin/show/bb/series/bbus/season/2
/admin/shows/big-brother/series/big-brother-us/seasons/2

/admin/show
/admin/show-{id}
/admin/show-{id}/series
/admin/show-{id}/series-{id}
/admin/show-{id}/series-{id}/season
/admin/show-{id}/series-{id}/season-{id}
/admin/show-bb/series-bbus/season/2

/admin/users
```


#### Player

```
/admin/{...}
/login
/logout
/privacy
/rules
/api

/user (redirects to user/dashboard)
/user/dashboard --> (logged user)
/user/settings
/user/{username} --> (profile of a specific player)\


/game
/game/bb-us-2 (show-series-season)
/game/bb-us-2/market/
/game/bb-us-2/market/projections (/current-cycle)
/game/bb-us-2/market/{cycle-slug}
/game/bb-us-2/leaderboard (/current-cycle)
/game/bb-us-2/leaderboard/{cycle-slug}
/game/bb-us-2/leaderboard/week-8

/game/bb-us-2/survey (/current-cycle)
/game/bb-us-2/survey/{cycle-slug}
/game/bb-us-2/survey/week-1
	(logged user survey for all participants still active during that cycle + extra questions)
	
/game/bb-us-2/participant
	list all participants (even the ones that are not active anymore)
/game/bb-us-2/participant/{participant-slug}

projection: predictions about how much a stock for participants will cost based on their projected ratings

/game/bb-us-2/participant/projections
/game/bb-us-2/market/projections
```
