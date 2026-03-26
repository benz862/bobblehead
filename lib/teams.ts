// Real team rosters with colors for each major league

export interface Team {
  name: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor?: string;
}

export const NHL_TEAMS: Team[] = [
  { name: "Anaheim Ducks", primaryColor: "black", secondaryColor: "orange", accentColor: "gold" },
  { name: "Arizona Coyotes", primaryColor: "brick red", secondaryColor: "sand", accentColor: "black" },
  { name: "Boston Bruins", primaryColor: "black", secondaryColor: "gold" },
  { name: "Buffalo Sabres", primaryColor: "navy blue", secondaryColor: "gold" },
  { name: "Calgary Flames", primaryColor: "red", secondaryColor: "gold", accentColor: "black" },
  { name: "Carolina Hurricanes", primaryColor: "red", secondaryColor: "black", accentColor: "white" },
  { name: "Chicago Blackhawks", primaryColor: "red", secondaryColor: "black", accentColor: "white" },
  { name: "Colorado Avalanche", primaryColor: "burgundy", secondaryColor: "blue", accentColor: "silver" },
  { name: "Columbus Blue Jackets", primaryColor: "navy blue", secondaryColor: "red" },
  { name: "Dallas Stars", primaryColor: "victory green", secondaryColor: "white", accentColor: "silver" },
  { name: "Detroit Red Wings", primaryColor: "red", secondaryColor: "white" },
  { name: "Edmonton Oilers", primaryColor: "navy blue", secondaryColor: "copper orange" },
  { name: "Florida Panthers", primaryColor: "red", secondaryColor: "navy blue", accentColor: "gold" },
  { name: "Los Angeles Kings", primaryColor: "black", secondaryColor: "silver", accentColor: "white" },
  { name: "Minnesota Wild", primaryColor: "forest green", secondaryColor: "red", accentColor: "cream" },
  { name: "Montreal Canadiens", primaryColor: "red", secondaryColor: "blue", accentColor: "white" },
  { name: "Nashville Predators", primaryColor: "gold", secondaryColor: "navy blue" },
  { name: "New Jersey Devils", primaryColor: "red", secondaryColor: "black", accentColor: "white" },
  { name: "New York Islanders", primaryColor: "blue", secondaryColor: "orange" },
  { name: "New York Rangers", primaryColor: "blue", secondaryColor: "red", accentColor: "white" },
  { name: "Ottawa Senators", primaryColor: "red", secondaryColor: "black", accentColor: "gold" },
  { name: "Philadelphia Flyers", primaryColor: "orange", secondaryColor: "black", accentColor: "white" },
  { name: "Pittsburgh Penguins", primaryColor: "black", secondaryColor: "gold" },
  { name: "San Jose Sharks", primaryColor: "teal", secondaryColor: "black", accentColor: "orange" },
  { name: "Seattle Kraken", primaryColor: "deep sea blue", secondaryColor: "ice blue", accentColor: "red" },
  { name: "St. Louis Blues", primaryColor: "blue", secondaryColor: "gold", accentColor: "white" },
  { name: "Tampa Bay Lightning", primaryColor: "blue", secondaryColor: "white" },
  { name: "Toronto Maple Leafs", primaryColor: "blue", secondaryColor: "white" },
  { name: "Utah Hockey Club", primaryColor: "black", secondaryColor: "light blue", accentColor: "yellow" },
  { name: "Vancouver Canucks", primaryColor: "blue", secondaryColor: "green", accentColor: "white" },
  { name: "Vegas Golden Knights", primaryColor: "gold", secondaryColor: "steel gray", accentColor: "red" },
  { name: "Washington Capitals", primaryColor: "red", secondaryColor: "navy blue", accentColor: "white" },
  { name: "Winnipeg Jets", primaryColor: "dark blue", secondaryColor: "light blue", accentColor: "white" },
];

export const NFL_TEAMS: Team[] = [
  { name: "Arizona Cardinals", primaryColor: "cardinal red", secondaryColor: "white", accentColor: "black" },
  { name: "Atlanta Falcons", primaryColor: "black", secondaryColor: "red" },
  { name: "Baltimore Ravens", primaryColor: "purple", secondaryColor: "black", accentColor: "gold" },
  { name: "Buffalo Bills", primaryColor: "royal blue", secondaryColor: "red" },
  { name: "Carolina Panthers", primaryColor: "black", secondaryColor: "process blue", accentColor: "silver" },
  { name: "Chicago Bears", primaryColor: "dark navy", secondaryColor: "orange" },
  { name: "Cincinnati Bengals", primaryColor: "black", secondaryColor: "orange" },
  { name: "Cleveland Browns", primaryColor: "brown", secondaryColor: "orange" },
  { name: "Dallas Cowboys", primaryColor: "navy blue", secondaryColor: "silver", accentColor: "white" },
  { name: "Denver Broncos", primaryColor: "orange", secondaryColor: "navy blue" },
  { name: "Detroit Lions", primaryColor: "honolulu blue", secondaryColor: "silver" },
  { name: "Green Bay Packers", primaryColor: "dark green", secondaryColor: "gold" },
  { name: "Houston Texans", primaryColor: "deep steel blue", secondaryColor: "battle red" },
  { name: "Indianapolis Colts", primaryColor: "royal blue", secondaryColor: "white" },
  { name: "Jacksonville Jaguars", primaryColor: "teal", secondaryColor: "black", accentColor: "gold" },
  { name: "Kansas City Chiefs", primaryColor: "red", secondaryColor: "gold" },
  { name: "Las Vegas Raiders", primaryColor: "silver", secondaryColor: "black" },
  { name: "Los Angeles Chargers", primaryColor: "powder blue", secondaryColor: "gold", accentColor: "navy" },
  { name: "Los Angeles Rams", primaryColor: "royal blue", secondaryColor: "sol yellow" },
  { name: "Miami Dolphins", primaryColor: "aqua", secondaryColor: "orange" },
  { name: "Minnesota Vikings", primaryColor: "purple", secondaryColor: "gold" },
  { name: "New England Patriots", primaryColor: "navy blue", secondaryColor: "red", accentColor: "silver" },
  { name: "New Orleans Saints", primaryColor: "black", secondaryColor: "old gold" },
  { name: "New York Giants", primaryColor: "dark blue", secondaryColor: "red" },
  { name: "New York Jets", primaryColor: "gotham green", secondaryColor: "white" },
  { name: "Philadelphia Eagles", primaryColor: "midnight green", secondaryColor: "silver", accentColor: "black" },
  { name: "Pittsburgh Steelers", primaryColor: "black", secondaryColor: "gold" },
  { name: "San Francisco 49ers", primaryColor: "scarlet red", secondaryColor: "gold" },
  { name: "Seattle Seahawks", primaryColor: "college navy", secondaryColor: "action green", accentColor: "wolf gray" },
  { name: "Tampa Bay Buccaneers", primaryColor: "red", secondaryColor: "pewter", accentColor: "black" },
  { name: "Tennessee Titans", primaryColor: "navy blue", secondaryColor: "titans blue", accentColor: "red" },
  { name: "Washington Commanders", primaryColor: "burgundy", secondaryColor: "gold" },
];

export const MLB_TEAMS: Team[] = [
  { name: "Arizona Diamondbacks", primaryColor: "sedona red", secondaryColor: "black", accentColor: "teal" },
  { name: "Atlanta Braves", primaryColor: "navy blue", secondaryColor: "scarlet red" },
  { name: "Baltimore Orioles", primaryColor: "orange", secondaryColor: "black" },
  { name: "Boston Red Sox", primaryColor: "red", secondaryColor: "navy blue" },
  { name: "Chicago Cubs", primaryColor: "blue", secondaryColor: "red" },
  { name: "Chicago White Sox", primaryColor: "black", secondaryColor: "silver" },
  { name: "Cincinnati Reds", primaryColor: "red", secondaryColor: "white", accentColor: "black" },
  { name: "Cleveland Guardians", primaryColor: "navy blue", secondaryColor: "red" },
  { name: "Colorado Rockies", primaryColor: "purple", secondaryColor: "black", accentColor: "silver" },
  { name: "Detroit Tigers", primaryColor: "navy blue", secondaryColor: "orange", accentColor: "white" },
  { name: "Houston Astros", primaryColor: "navy blue", secondaryColor: "orange" },
  { name: "Kansas City Royals", primaryColor: "royal blue", secondaryColor: "white", accentColor: "gold" },
  { name: "Los Angeles Angels", primaryColor: "red", secondaryColor: "navy blue" },
  { name: "Los Angeles Dodgers", primaryColor: "dodger blue", secondaryColor: "white" },
  { name: "Miami Marlins", primaryColor: "black", secondaryColor: "blue", accentColor: "red" },
  { name: "Milwaukee Brewers", primaryColor: "navy blue", secondaryColor: "gold" },
  { name: "Minnesota Twins", primaryColor: "navy blue", secondaryColor: "red" },
  { name: "New York Mets", primaryColor: "blue", secondaryColor: "orange" },
  { name: "New York Yankees", primaryColor: "navy blue", secondaryColor: "white" },
  { name: "Oakland Athletics", primaryColor: "green", secondaryColor: "gold" },
  { name: "Philadelphia Phillies", primaryColor: "red", secondaryColor: "blue", accentColor: "white" },
  { name: "Pittsburgh Pirates", primaryColor: "black", secondaryColor: "gold" },
  { name: "San Diego Padres", primaryColor: "brown", secondaryColor: "gold" },
  { name: "San Francisco Giants", primaryColor: "orange", secondaryColor: "black", accentColor: "cream" },
  { name: "Seattle Mariners", primaryColor: "navy blue", secondaryColor: "teal", accentColor: "silver" },
  { name: "St. Louis Cardinals", primaryColor: "red", secondaryColor: "navy blue" },
  { name: "Tampa Bay Rays", primaryColor: "navy blue", secondaryColor: "light blue", accentColor: "yellow" },
  { name: "Texas Rangers", primaryColor: "blue", secondaryColor: "red" },
  { name: "Toronto Blue Jays", primaryColor: "royal blue", secondaryColor: "navy blue", accentColor: "red" },
  { name: "Washington Nationals", primaryColor: "red", secondaryColor: "navy blue" },
];

export const MLS_TEAMS: Team[] = [
  { name: "Atlanta United FC", primaryColor: "red", secondaryColor: "black", accentColor: "gold" },
  { name: "Austin FC", primaryColor: "verde green", secondaryColor: "black" },
  { name: "Charlotte FC", primaryColor: "blue", secondaryColor: "black" },
  { name: "Chicago Fire FC", primaryColor: "red", secondaryColor: "navy blue" },
  { name: "FC Cincinnati", primaryColor: "orange", secondaryColor: "blue" },
  { name: "Colorado Rapids", primaryColor: "burgundy", secondaryColor: "sky blue" },
  { name: "Columbus Crew", primaryColor: "black", secondaryColor: "gold" },
  { name: "D.C. United", primaryColor: "black", secondaryColor: "red" },
  { name: "FC Dallas", primaryColor: "red", secondaryColor: "blue" },
  { name: "Houston Dynamo FC", primaryColor: "orange", secondaryColor: "white" },
  { name: "Sporting Kansas City", primaryColor: "dark blue", secondaryColor: "light blue" },
  { name: "LA Galaxy", primaryColor: "navy blue", secondaryColor: "gold" },
  { name: "LAFC", primaryColor: "black", secondaryColor: "gold" },
  { name: "Inter Miami CF", primaryColor: "pink", secondaryColor: "black" },
  { name: "Minnesota United FC", primaryColor: "dark gray", secondaryColor: "light blue" },
  { name: "CF Montréal", primaryColor: "black", secondaryColor: "blue" },
  { name: "Nashville SC", primaryColor: "gold", secondaryColor: "navy blue" },
  { name: "New England Revolution", primaryColor: "navy blue", secondaryColor: "red" },
  { name: "New York City FC", primaryColor: "sky blue", secondaryColor: "navy blue", accentColor: "orange" },
  { name: "New York Red Bulls", primaryColor: "red", secondaryColor: "white" },
  { name: "Orlando City SC", primaryColor: "purple", secondaryColor: "white" },
  { name: "Philadelphia Union", primaryColor: "navy blue", secondaryColor: "gold" },
  { name: "Portland Timbers", primaryColor: "green", secondaryColor: "gold" },
  { name: "Real Salt Lake", primaryColor: "red", secondaryColor: "royal blue", accentColor: "gold" },
  { name: "San Jose Earthquakes", primaryColor: "blue", secondaryColor: "black" },
  { name: "Seattle Sounders FC", primaryColor: "rave green", secondaryColor: "blue" },
  { name: "St. Louis City SC", primaryColor: "red", secondaryColor: "navy blue" },
  { name: "Toronto FC", primaryColor: "red", secondaryColor: "gray" },
  { name: "Vancouver Whitecaps FC", primaryColor: "dark blue", secondaryColor: "white" },
];

export const PREMIER_LEAGUE_TEAMS: Team[] = [
  { name: "Arsenal", primaryColor: "red", secondaryColor: "white" },
  { name: "Aston Villa", primaryColor: "claret", secondaryColor: "sky blue" },
  { name: "AFC Bournemouth", primaryColor: "red", secondaryColor: "black" },
  { name: "Brentford", primaryColor: "red", secondaryColor: "white", accentColor: "black" },
  { name: "Brighton & Hove Albion", primaryColor: "blue", secondaryColor: "white" },
  { name: "Chelsea", primaryColor: "royal blue", secondaryColor: "white" },
  { name: "Crystal Palace", primaryColor: "red", secondaryColor: "blue" },
  { name: "Everton", primaryColor: "royal blue", secondaryColor: "white" },
  { name: "Fulham", primaryColor: "white", secondaryColor: "black" },
  { name: "Ipswich Town", primaryColor: "blue", secondaryColor: "white" },
  { name: "Leicester City", primaryColor: "blue", secondaryColor: "white", accentColor: "gold" },
  { name: "Liverpool", primaryColor: "red", secondaryColor: "white" },
  { name: "Manchester City", primaryColor: "sky blue", secondaryColor: "white" },
  { name: "Manchester United", primaryColor: "red", secondaryColor: "white", accentColor: "black" },
  { name: "Newcastle United", primaryColor: "black", secondaryColor: "white" },
  { name: "Nottingham Forest", primaryColor: "red", secondaryColor: "white" },
  { name: "Southampton", primaryColor: "red", secondaryColor: "white", accentColor: "black" },
  { name: "Tottenham Hotspur", primaryColor: "white", secondaryColor: "navy blue" },
  { name: "West Ham United", primaryColor: "claret", secondaryColor: "sky blue" },
  { name: "Wolverhampton Wanderers", primaryColor: "old gold", secondaryColor: "black" },
];

export const BUNDESLIGA_TEAMS: Team[] = [
  { name: "Bayern Munich", primaryColor: "red", secondaryColor: "white" },
  { name: "Borussia Dortmund", primaryColor: "yellow", secondaryColor: "black" },
  { name: "RB Leipzig", primaryColor: "white", secondaryColor: "red" },
  { name: "Bayer Leverkusen", primaryColor: "red", secondaryColor: "black" },
  { name: "Eintracht Frankfurt", primaryColor: "black", secondaryColor: "red", accentColor: "white" },
  { name: "VfB Stuttgart", primaryColor: "white", secondaryColor: "red" },
  { name: "Borussia Mönchengladbach", primaryColor: "white", secondaryColor: "black", accentColor: "green" },
  { name: "VfL Wolfsburg", primaryColor: "green", secondaryColor: "white" },
  { name: "SC Freiburg", primaryColor: "red", secondaryColor: "black" },
  { name: "TSG Hoffenheim", primaryColor: "blue", secondaryColor: "white" },
  { name: "FC Union Berlin", primaryColor: "red", secondaryColor: "yellow" },
  { name: "1. FC Köln", primaryColor: "red", secondaryColor: "white" },
  { name: "Werder Bremen", primaryColor: "green", secondaryColor: "white" },
];

export const LA_LIGA_TEAMS: Team[] = [
  { name: "Real Madrid", primaryColor: "white", secondaryColor: "gold" },
  { name: "FC Barcelona", primaryColor: "blue", secondaryColor: "garnet red" },
  { name: "Atletico Madrid", primaryColor: "red", secondaryColor: "white", accentColor: "blue" },
  { name: "Sevilla FC", primaryColor: "white", secondaryColor: "red" },
  { name: "Real Sociedad", primaryColor: "blue", secondaryColor: "white" },
  { name: "Real Betis", primaryColor: "green", secondaryColor: "white" },
  { name: "Villarreal CF", primaryColor: "yellow", secondaryColor: "blue" },
  { name: "Athletic Bilbao", primaryColor: "red", secondaryColor: "white" },
  { name: "Valencia CF", primaryColor: "white", secondaryColor: "black", accentColor: "orange" },
  { name: "Girona FC", primaryColor: "red", secondaryColor: "white" },
];

export const SERIE_A_TEAMS: Team[] = [
  { name: "Juventus", primaryColor: "black", secondaryColor: "white" },
  { name: "AC Milan", primaryColor: "red", secondaryColor: "black" },
  { name: "Inter Milan", primaryColor: "blue", secondaryColor: "black" },
  { name: "SSC Napoli", primaryColor: "sky blue", secondaryColor: "white" },
  { name: "AS Roma", primaryColor: "dark red", secondaryColor: "yellow" },
  { name: "SS Lazio", primaryColor: "sky blue", secondaryColor: "white" },
  { name: "Atalanta", primaryColor: "blue", secondaryColor: "black" },
  { name: "ACF Fiorentina", primaryColor: "purple", secondaryColor: "white" },
];

export const LIGUE_1_TEAMS: Team[] = [
  { name: "Paris Saint-Germain", primaryColor: "navy blue", secondaryColor: "red", accentColor: "white" },
  { name: "Olympique de Marseille", primaryColor: "white", secondaryColor: "sky blue" },
  { name: "Olympique Lyonnais", primaryColor: "white", secondaryColor: "blue", accentColor: "red" },
  { name: "AS Monaco", primaryColor: "red", secondaryColor: "white" },
  { name: "Lille OSC", primaryColor: "red", secondaryColor: "white" },
  { name: "OGC Nice", primaryColor: "red", secondaryColor: "black" },
];

// Soccer leagues grouped
export interface SoccerLeague {
  name: string;
  teams: Team[];
}

export const SOCCER_LEAGUES: SoccerLeague[] = [
  { name: "MLS (USA/Canada)", teams: MLS_TEAMS },
  { name: "Premier League (England)", teams: PREMIER_LEAGUE_TEAMS },
  { name: "Bundesliga (Germany)", teams: BUNDESLIGA_TEAMS },
  { name: "La Liga (Spain)", teams: LA_LIGA_TEAMS },
  { name: "Serie A (Italy)", teams: SERIE_A_TEAMS },
  { name: "Ligue 1 (France)", teams: LIGUE_1_TEAMS },
];

// Map sport to league teams (soccer handled separately via SOCCER_LEAGUES)
export const SPORT_TEAMS: Record<string, Team[]> = {
  hockey: NHL_TEAMS,
  football: NFL_TEAMS,
  baseball: MLB_TEAMS,
};

// Sport-specific orientation questions
export interface OrientationField {
  label: string;
  options: string[];
  condition?: { field: string; value: string }; // only show if this condition is met
}

export const SPORT_ORIENTATIONS: Record<string, OrientationField[]> = {
  hockey: [
    { label: "Shoots", options: ["Left", "Right"] },
    { label: "Catches", options: ["Left", "Right"], condition: { field: "position", value: "goalie" } },
  ],
  baseball: [
    { label: "Bats", options: ["Left", "Right", "Switch"] },
    { label: "Throws", options: ["Left", "Right"] },
  ],
  football: [
    { label: "Throws", options: ["Left", "Right"], condition: { field: "position", value: "quarterback" } },
  ],
  soccer: [
    { label: "Dominant Foot", options: ["Left", "Right"] },
  ],
  boxing: [
    { label: "Stance", options: ["Orthodox (Right-handed)", "Southpaw (Left-handed)"] },
  ],
  golf: [
    { label: "Swing", options: ["Left", "Right"] },
  ],
};

// Sport-specific position lists
export const SPORT_POSITIONS: Record<string, string[]> = {
  hockey: ["Center", "Left Wing", "Right Wing", "Defenseman", "Goalie"],
  baseball: ["Pitcher", "Catcher", "First Base", "Second Base", "Shortstop", "Third Base", "Left Field", "Center Field", "Right Field", "Designated Hitter"],
  football: ["Quarterback", "Running Back", "Wide Receiver", "Tight End", "Offensive Lineman", "Defensive End", "Linebacker", "Cornerback", "Safety", "Kicker"],
  soccer: ["Goalkeeper", "Center Back", "Full Back", "Midfielder", "Winger", "Striker"],
  boxing: ["Heavyweight", "Middleweight", "Welterweight", "Lightweight", "Featherweight", "Bantamweight"],
  golf: [""],
};
