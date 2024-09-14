/* eslint-disable @typescript-eslint/no-unused-vars */

type CityName = "Lagos" | "Abuja" | "Kaduna";
type CityCordinates = {
  x: number;
  y: number;
};

type City = CityName | CityCordinates;

type User = {
  birthCity: City;
  currentCity: City;
};

const user = {
  birthCity: "Lagos",
  currentCity: { x: 5, y: 10 },
} satisfies User;

// eslint-disable-next-line @typescript-eslint/no-unsafe-call
user.birthCity.toUpperCase();
