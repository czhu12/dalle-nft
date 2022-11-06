import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { Button, Container, Form, InputGroup, Image, Row, Col } from 'react-bootstrap';
import { buildRoute } from '../src/app/auth/client/routes';


const theme = "danger";
const generateRandomPrompt = () => {
  const choices = [
    "keanu Reeves portrait photo of a asia old warrior chief, tribal panther make up, blue on red, side profile, looking away, serious eyes, 50mm",
    "city/garden of spirits painted by Hayao Miyazaki",
    "claymation art of a old man playing guitar, 100mm, candle lightning, industrial colours, extremely detailed",
    "ukiyo-e painting of a cat hacker wearing VR headsets, on a postage stamp",
    "dinosaurs playing baseball in watercolor style",
    "acrylic on canvas portrait of the Bride of Frankenstein",
    "an airbrush caricature of an old man",
  ]
  const index = Math.floor(Math.random() * choices.length);
  return choices[index];
}

const Generate = ({}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [prompt, setPrompt] = useState(generateRandomPrompt());
  const [generationPrompt, setGenerationPrompt] = useState(null);
  const fetchGenerationPrompt = async () => {
    const response = await axios.get(buildRoute(`/ai_generation/generations/${8}`))
    setGenerationPrompt(response.data);
  }
  useEffect(() => {
    document.getElementById('textarea').focus();
    fetchGenerationPrompt();
  }, [])

  const createGenerationPrompt = async () => {
    setLoading(true);
    const response = await axios.post(
      buildRoute('/ai_generation/generations'),
      { prompt: prompt },
    );
    setGenerationPrompt(response.data);
    setCurrentStep(1);
    setLoading(false);
  }

  return (
    <div className="ai-generate">
      <Container>
        {currentStep === 0 && (
          <div className="top-bottom-nav text-center">
            <div>
              <div className="text-center">
                <div className="mt-5 mb-2 display-2">
                  A new thing
                </div>

                <div className="mb-5 display-5">
                  Generate art with text and then create a 1 / 1 NFT
                </div>
              </div>
              <div>
                <Row>
                  <Col xs="auto" className="big-quotes"><img src="/images/quotes-start.png"/></Col>
                  <Col>
                    <textarea
                      id="textarea"
                      autoFocus
                      value={prompt}
                      rows={2}
                      onChange={(e) => {
                        setPrompt(e.target.value);
                      }}
                    />
                  </Col>
                  <Col xs="auto" className="big-quotes"><img src="/images/quotes-end.png"/></Col>
                </Row>
              </div>
              <div className="text-right mt-xs-4">
                <i className={`mdi mdi-refresh text-${theme} display-2 pointer`} onClick={() => {
                  setPrompt(generateRandomPrompt());
                }}></i>
              </div>
            </div>
            <Button
              disabled={loading}
              block
              onClick={createGenerationPrompt}
              className="my-4"
              size="lg"
              variant={theme}
            >
              {loading && "Generating..."}
              {!loading && "Generate"}
            </Button>
          </div>
        )}
        {currentStep === 1 && (
          <div className="top-bottom-nav text-center">
            <div>
              <Image className="main-image" fluid src={generationPrompt?.generation_image.source_url} />
              <div className="font-italic display-4">
                “{generationPrompt.prompt}”
              </div>
            </div>
            <div className="mb-4">
              <Button
                block
                onClick={() => setCurrentStep(1)}
                className="my-4"
                size="lg"
                variant={theme}
              >Create NFT</Button>
              <a href="#" onClick={(e) => {
                e.preventDefault();
                setCurrentStep(0);
              }}>Go Back</a>
            </div>
          </div>
        )}
        {currentStep === 2 && (
          <div>

          </div>
        )}
      </Container>
    </div>
  );
}

export default Generate;
