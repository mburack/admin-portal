import React from 'react';
import { Dropdown } from 'react-bootstrap';
import './EventTurnout.css'

function EventTurnout() {
    const CustomToggle = React.forwardRef(({ children, onClick }, ref) => (
        <div className="options-menu">
            <p className="menu-title">{children}</p>
            <a
                href="/#"
                ref={ref}
                onClick={(e) => {
                e.preventDefault();
                onClick(e);
                }}
                className="dropdown-btn"
            >
                &#x2304;
            </a>
        </div>
    ));

    const CustomMenu = React.forwardRef(
        ({ children, style, className, 'aria-labelledby': labeledBy }, ref) => {
      
          return (
            <div
              ref={ref}
              style={style}
              className={className}
              aria-labelledby={labeledBy}
            >
              <ul className="list-unstyled">
                {React.Children.toArray(children)}
              </ul>
            </div>
          );
        },
      );
    
    return (
        <div>
            <Dropdown>
                <Dropdown.Toggle as={CustomToggle} id="dropdown-custom-components">
                    Recruit Participants 
                </Dropdown.Toggle>

                <Dropdown.Menu as={CustomMenu}>
                    <Dropdown.Item eventKey="1">One</Dropdown.Item>
                    <Dropdown.Item eventKey="2">Two</Dropdown.Item>
                    <Dropdown.Item eventKey="3">Three</Dropdown.Item>
                </Dropdown.Menu>
            </Dropdown>
        </div>
    )
}

export default EventTurnout;