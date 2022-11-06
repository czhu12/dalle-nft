import React from 'react';
import { Button, Card } from 'react-bootstrap';

const OptionCard = ({onClick, buttonText="Select", active, children}) => (
  <Card className="pointer text-center h-100" onClick={onClick}>
    <Card.Body>
     {children}
    </Card.Body>
    <Card.Footer>
      <Button block variant={active ? "info" : "outline-info"} size="lg" dangerouslySetInnerHTML={{__html: buttonText}}></Button>
    </Card.Footer>
  </Card>
)

export default OptionCard;

