import React, { FC, useEffect, useState, Fragment } from "react";
import {
  Card,
  Grid,
  Title,
  Text,
  Tab,
  TabList,
  TabGroup,
  TabPanel,
  TabPanels,
  Metric,
  LineChart,
} from "@tremor/react";
import { useStore, useStream } from "../state";
import VideoStream from "./VideoStream";
import GPSLocation from "./GPSLocation";
import { GetPositionResponse } from "@viamrobotics/sdk";
import { GPSPos } from "./GPSLocation";
import OSModuleDash from "./OSModuleDash";

const demo_robot = {
  name: "Demo Rover",
  hostname: process.env.REACT_APP_DEMO_BOT_HOSTNAME!,
  secret: process.env.REACT_APP_DEMO_BOT_SECRET!,
};

const ViamDashboard = () => {
  const {
    status,
    connectOrDisconnect,
    streamClient,
    gpsMovementSensorClient,
    osStatsSensorClient,
  } = useStore();

  const handleConnectButton = () => {
    const demoRobotCredentials = {
      hostname: demo_robot.hostname,
      secret: demo_robot.secret,
    };
    connectOrDisconnect(demoRobotCredentials);
  };

  const webcam_stream = useStream(streamClient, "cam");
  const realsense_stream = useStream(streamClient, "realsense-camera");

  const [gpsPosition, setGpsPosition] = useState<GPSPos | null>(null);
  const [osStats, setOsStats] = useState<any | null>(null);

  useEffect(() => {
    gpsMovementSensorClient
      ?.getPosition()
      .then((data) => {
        //@ts-ignore
        setGpsPosition({
          altitudeM: data.altitudeM,
          coordinate: {
            latitude: data?.coordinate?.latitude!,
            longitude: data?.coordinate?.longitude!,
          },
        });
        return data;
      })
      .catch((err) => {
        console.log("error in getting gps position");
        console.log(err);
      });
  }, [status]);

  useEffect(() => {
    osStatsSensorClient?.getReadings().then((data) => {
      console.log(JSON.stringify(data, null, 2));
      setOsStats(data);
    });
  }, [osStatsSensorClient]);

  return (
    <main>
      <div className="flex w-full items-center justify-between">
        <div className="flex flex-col space-y-2">
          <Title>Viam Dashboard Demo</Title>
          <Text>Connect to your robot to populate the dashboard.</Text>
        </div>
        <button
          onClick={handleConnectButton}
          className="px-4 py-2 bg-black rounded-md font-semibold text-white"
        >
          <div className="min-w-[64px] min-h-[24px] flex items-center justify-center">
            {" "}
            {status == "loading" ? (
              <svg
                aria-hidden="true"
                className="w-6 h-6 text-gray-200 animate-spin fill-black"
                viewBox="0 0 100 101"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                  fill="currentColor"
                />
                <path
                  d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                  fill="currentFill"
                />
              </svg>
            ) : status == "connected" ? (
              "Disconnect"
            ) : (
              "Connect to Robot"
            )}
          </div>
        </button>
      </div>

      <TabGroup className="mt-6">
        <TabList>
          <Tab>Live Data</Tab>
        </TabList>
        <TabPanels>
          <TabPanel>
            <div className="mt-6 flex space-x-8 h-full w-full">
              {webcam_stream && (
                <Card className="mt-8 ">
                  <Title className="absolute -top-10 -left-0">
                    Webcam Stream
                  </Title>
                  <VideoStream stream={webcam_stream} className="rounded-sm" />
                </Card>
              )}
              {realsense_stream && (
                <Card className="mt-8">
                  <Title className="absolute -top-10 -left-0">
                    Realsense Stream
                  </Title>
                  <VideoStream
                    stream={realsense_stream}
                    className="rounded-sm"
                  />
                </Card>
              )}
              {gpsPosition && (
                <Card className="mt-8">
                  {/** have to do this absolute positioning hack bc
                   * title rendering is weird w/ the map component.
                   *
                   * for consistency sake, doing it w above as well
                   *
                   */}
                  <Title className="absolute -top-10 -left-0">
                    GPS Position
                  </Title>

                  <GPSLocation gpsPosition={gpsPosition} />
                </Card>
              )}
            </div>
            <div className="mt-4">
              <OSModuleDash osData={osStats} />
            </div>
          </TabPanel>
        </TabPanels>
      </TabGroup>
    </main>
  );
};

export default ViamDashboard;
