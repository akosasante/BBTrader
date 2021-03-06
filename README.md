Trade Machine
===

**Trade Machine** (formerly, and informally, BBTrader) is a web application built with **_Node.js_** and **_Express_** on the backend, **_Vue_** on the frontend, and uses **_MongoDB_** as the database.
It was created for the 20-person ESPN fantasy baseball league, [Flex Fox Fantasy Federation](http://flexfoxfantasy.com/). It provides the members of the league with a standardized way to propose trades with each other before the trades are formally submitted on the ESPN sites. 

Communication takes place through the site, which will then send emails to the member the trade was proposed to. When the two (or three) trade participants have agreed to a trade, it is announced on the league's slack channel by _"TradeBot"_. The trade is also automatically recorded in the league administrators' Google Sheet.


To Do:
---
- [x] Add UI for admin tasks
- [ ] UI refresh before ~2018-2019~ ~2019-2020~ 2020-2021 (this time I've actually got a lot more done, so the goal should be reasonable 😅) season
- [ ] Respond to feedback/bugs/feature requests submitted to Trello by league members

(Far) Future Considerations:
---
- Generalize so that any league could use the system
