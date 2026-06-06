import { useState } from 'react'
import EventsPane from './timeline/EventsPane'
import IncidentsPane from './timeline/IncidentsPane'
import ManualPane from './timeline/ManualPane'
import AnalyticsPane from './timeline/AnalyticsPane'

const TABS = [
  { id: 'timeline', label: 'Events' },
  { id: 'incidents', label: 'Incidents' },
  { id: 'manual', label: 'Manual' },
  { id: 'analytics', label: 'Data' },
]

/**
 * Timeline — khung có 4 tab: Events / Incidents / Manual / Data.
 * Mỗi tab là một pane riêng; chỉ render pane đang active.
 */
export default function Timeline() {
  const [tab, setTab] = useState('timeline')

  return (
    <div className="timeline-wrap">
      <div className="timeline-tabs">
        {TABS.map((t) => (
          <div key={t.id} className={`ttab${tab === t.id ? ' active' : ''}`} onClick={() => setTab(t.id)}>
            {t.label}
          </div>
        ))}
      </div>
      <div className="tab-body">
        {tab === 'timeline' && <EventsPane />}
        {tab === 'incidents' && <IncidentsPane />}
        {tab === 'manual' && <ManualPane />}
        {tab === 'analytics' && <AnalyticsPane />}
      </div>
    </div>
  )
}
