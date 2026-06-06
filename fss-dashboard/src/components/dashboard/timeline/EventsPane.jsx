import { useFss } from '../../../context/FssContext'

/**
 * EventsPane — danh sách sự kiện hệ thống theo thời gian thực.
 */
export default function EventsPane() {
  const { state } = useFss()

  return (
    <div className="tab-pane active" id="pane-timeline">
      <div id="timeline">
        {state.events.map((e) => (
          <div className={`tl-item${e.type === 'fire' ? ' fire' : ''}`} key={e.key}>
            <div className="tl-icon">{e.icon}</div>
            <div className="tl-time">{e.time}</div>
            <div className="tl-text">{e.bold ? <strong>{e.text}</strong> : e.text}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
