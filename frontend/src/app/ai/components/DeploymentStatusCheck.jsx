import { Col, Row } from "react-bootstrap";

export default function DeploymentStatusCheck({text, success, warning}) {
  return (
    <Row className="mb-1">
      <Col xs="auto">
        <h6>{text}</h6>
      </Col>
      <Col>

      </Col>
      <Col xs="auto">
        <h5>
          {!warning && success === true && <i className="mdi mdi-check-circle text-success" />}
          {success !== false && warning && <i className="mdi mdi-alert-circle text-warning" />}
          {success === false && <i className="mdi mdi-close-circle text-danger" />}
        </h5>
      </Col>
    </Row>
  )
}
