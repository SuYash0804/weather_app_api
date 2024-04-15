import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { weatherAppId } from "../utils/ids";
import Chart from "react-apexcharts";
import axios from "axios";
import moment from "moment";

interface WeatherData {
  description: string;
  icon: string;
  id: number;
  main: string;
}

interface Main {
  feels_like: number;
  grnd_level: number;
  humidity: number;
  pressure: number;
  sea_level: number;
  temp: number;
  temp_max: number;
  temp_min: number;
}

interface Wind {
  deg: number;
  gust: number;
  speed: number;
}

interface MainData {
  main: Main;
  weather: WeatherData[];
  wind: Wind;
  dt_txt: string;
}

const units = {
  metric: {
    temperature: "°C",
    windSpeed: "m/s",
    pressure: "hPa",
    visibility: "m",
    rainfall: "mm",
  },
  imperial: {
    temperature: "°F",
    windSpeed: "mph",
    pressure: "inHg",
    visibility: "mi",
    rainfall: "in",
  },
  standard: {
    temperature: "K",
  },
};

const Weather = () => {
  const params = useParams();

  const [redirect, setRedirect] = useState<boolean>(!Boolean(params));

  const [mainData, setMainData] = useState<MainData>({
    weather: [
      {
        id: 0,
        main: "",
        description: "",
        icon: "",
      },
    ],
    main: {
      temp: 0,
      feels_like: 0,
      temp_min: 0,
      temp_max: 0,
      pressure: 0,
      humidity: 0,
      sea_level: 0,
      grnd_level: 0,
    },
    wind: {
      speed: 0,
      deg: 0,
      gust: 0,
    },
    dt_txt: "",
  });

  const [forecastData, setForeCastData] = useState<MainData[]>([]);

  async function getWeather() {
    try {
      if (typeof params.details === "string") {
        const parsedData = JSON.parse(params.details);

        const checkArray = ["", null, undefined];

        console.log(
          checkArray.includes(parsedData.name),
          checkArray.includes(parsedData.geonameId),
          checkArray.includes(parsedData.lon),
          checkArray.includes(parsedData.lat),
          parsedData
        );
        if (
          checkArray.includes(parsedData.geonameId) ||
          checkArray.includes(parsedData.lon) ||
          checkArray.includes(parsedData.lat)
        ) {
          setRedirect(true);
          return;
        }

        const url1 = `http://api.openweathermap.org/data/2.5/weather?lon=${parsedData.lon}&lat=${parsedData.lat}&appid=${weatherAppId}&units=metric`;
        const url2 = `http://api.openweathermap.org/data/2.5/forecast?lon=${parsedData.lon}&lat=${parsedData.lat}&appid=${weatherAppId}&units=metric`;

        // const { data } = await axios.get(url1);

        const promises = await Promise.all([axios.get(url1), axios.get(url2)]);

        console.log("promises", promises);
        setMainData(promises[0].data);
        setForeCastData(promises[1].data.list);
      } else {
        setRedirect(true);
      }
      // const {name, lon, lat, geonameid} = JSON.parse(params.details)
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(() => {
    if (!redirect) {
      getWeather();
    }
  }, []);
  return (
    <div className="relative">
      <div className="fixed w-screen h-screen bg-[url('https://img.freepik.com/free-photo/empty-street-dark-atmosphere_23-2150914402.jpg?t=st=1713146164~exp=1713149764~hmac=c18a4b9999949d22e615fcc310504bcbe2e6ff753a65e69f75328db28a71047b')] bg-cover z-0"></div>
      {redirect ? (
        <div className="z-10">
          Could not find the data. Try selecting the{" "}
          <Link className="text-[blue]" to={"/"}>
            City
          </Link>{" "}
          again
        </div>
      ) : (
        <div className={`flex flex-wrap items-stretch z-10 p-3`}>
          <div className={`sm:w-2/6 w-full p-3`}>
            <div className="w-full h-full rounded-lg bg-[rgba(255,255,255,0.125)] backdrop-blur-sm p-3 flex flex-col items-center">
              <img
                src={`https://openweathermap.org/img/wn/${mainData.weather[0].icon}@2x.png`}
                className="w-[35%]"
                alt=""
              />
              <p className="text-4xl font-bold text-white mb-3">
                {mainData.main.temp}
              </p>
              <div className="text-md text-white flex justify-between gap-5 w-[75%]">
                <span className="font-medium mb-2">Feels Like:</span>{" "}
                <span className="font-bold">{mainData.main.feels_like}</span>
              </div>
              <div className="text-md text-white flex justify-between gap-5 w-[75%]">
                <span className="font-medium mb-2">Minimum Temperature:</span>{" "}
                <span className="font-bold">{mainData.main.temp_min}</span>
              </div>
              <div className="text-md text-white flex justify-between gap-5 w-[75%]">
                <span className="font-medium mb-2">Maximum Temperature:</span>{" "}
                <span className="font-bold">{mainData.main.temp_max}</span>
              </div>
              <div className="text-md text-white flex justify-between gap-5 w-[75%]">
                <span className="font-medium mb-2">Pressure:</span>{" "}
                <span className="font-bold">{mainData.main.pressure}</span>
              </div>
              <div className="text-md text-white flex justify-between gap-5 w-[75%]">
                <span className="font-medium mb-2">Humidity:</span>{" "}
                <span className="font-bold">{mainData.main.humidity}</span>
              </div>
              <div className="text-md text-white flex justify-between gap-5 w-[75%]">
                <span className="font-medium mb-2">Sea Level:</span>{" "}
                <span className="font-bold">{mainData.main.sea_level}</span>
              </div>
              <div className="text-md text-white flex justify-between gap-5 w-[75%]">
                <span className="font-medium mb-2">Ground Level:</span>{" "}
                <span className="font-bold">{mainData.main.grnd_level}</span>
              </div>
            </div>
          </div>
          {/* <div className={`w-full p-3`}>
            <div className="w-full h-full rounded-lg bg-[rgba(255,255,255,0.125)] backdrop-blur-sm p-3 flex flex-col items-center">
              <Chart
                options={{
                  chart: {
                    id: "basic-bar",
                  },
                  xaxis: {
                    categories: forecastData.map((ele) => {
                      return moment(ele.dt_txt).format("D-MM-YY HH:mm");
                    }),
                  },
                  // yaxis: [
                  //   {
                  //     title: {
                  //       text: "Temperature"
                  //     }
                  //   },
                  //   {
                  //     opposite: true,
                  //     title: {
                  //       text: "Min Temperature"
                  //     }
                  //   },
                  //   {
                  //     opposite: true,
                  //     title: {
                  //       text: "Max Temperature"
                  //     }
                  //   }
                  // ]
                }}
                series={[
                  {
                    name: "Temperature",
                    data: forecastData.map((ele) => {
                      return ele.main.temp;
                    }),
                  },
                  {
                    name: "Min Temperature",
                    data: forecastData.map((ele) => {
                      return ele.main.temp_min;
                    }),
                  },
                  {
                    name: "Max Temperature",
                    data: forecastData.map((ele) => {
                      return ele.main.temp_max;
                    }),
                  },
                ]}
                width={"750px"}
              />
            </div>
          </div> */}
        </div>
      )}
    </div>
  );
};

export default Weather;
