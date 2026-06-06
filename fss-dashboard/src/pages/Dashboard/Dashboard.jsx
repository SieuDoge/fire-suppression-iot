import { FssProvider } from '../../context/FssContext'
import Header from '../../components/dashboard/Header'
import AlertBanner from '../../components/dashboard/AlertBanner'
import ServoTrackingMap from '../../components/dashboard/ServoTrackingMap'
import TrackingBar from '../../components/dashboard/TrackingBar'
import StatusBlocks from '../../components/dashboard/StatusBlocks'
import PumpControl from '../../components/dashboard/PumpControl'
import SensorPanel from '../../components/dashboard/SensorPanel'
import Timeline from '../../components/dashboard/Timeline'
import BottomBar from '../../components/dashboard/BottomBar'
import '../../styles/dashboard.css'

/**
 * Dashboard — trang giám sát & điều khiển hệ thống chữa cháy.
 * Toàn bộ con được bọc trong <FssProvider> để chia sẻ state/actions.
 */
export default function Dashboard() {
  return (
    <FssProvider>
      <div className="dashboard-page">
        <Header />
        <AlertBanner />

        <div className="main">
          {/* Cột trái: bản đồ servo + dải tracking + khối trạng thái */}
          <div className="left-col">
            <ServoTrackingMap />
            <TrackingBar />
            <StatusBlocks />
          </div>

          {/* Cột phải: bơm + cảm biến + timeline */}
          <div className="right-col">
            <PumpControl />
            <SensorPanel />
            <Timeline />
          </div>
        </div>

        <BottomBar />
      </div>
    </FssProvider>
  )
}
