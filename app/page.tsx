"use client"

import { useState, useEffect } from "react"
import { Bar, BarChart, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowRight, Info } from "lucide-react"

type HuffmanNode = {
  char: string
  frequency: number
  code: string
  left: HuffmanNode | null
  right: HuffmanNode | null
}

const getFrequencyData = (text: string) => {
  const freq: { [key: string]: number } = {}
  for (let char of text) {
    freq[char] = (freq[char] || 0) + 1
  }
  return Object.entries(freq).map(([char, count]) => ({ char, count }))
}

const buildHuffmanTree = (text: string): HuffmanNode => {
  const freq: { [key: string]: number } = {}
  for (let char of text) {
    freq[char] = (freq[char] || 0) + 1
  }

  const nodes: HuffmanNode[] = Object.entries(freq).map(([char, frequency]) => ({
    char,
    frequency,
    code: "",
    left: null,
    right: null,
  }))

  while (nodes.length > 1) {
    nodes.sort((a, b) => a.frequency - b.frequency)
    const left = nodes.shift()!
    const right = nodes.shift()!
    const parent: HuffmanNode = {
      char: left.char + right.char,
      frequency: left.frequency + right.frequency,
      code: "",
      left,
      right,
    }
    nodes.push(parent)
  }

  const assignCodes = (node: HuffmanNode, code: string) => {
    if (node.left === null && node.right === null) {
      node.code = code
    } else {
      assignCodes(node.left!, code + "0")
      assignCodes(node.right!, code + "1")
    }
  }

  assignCodes(nodes[0], "")
  return nodes[0]
}

const encodeText = (text: string, root: HuffmanNode): string => {
  const codes: { [key: string]: string } = {}
  const getCodes = (node: HuffmanNode) => {
    if (node.left === null && node.right === null) {
      codes[node.char] = node.code
    } else {
      getCodes(node.left!)
      getCodes(node.right!)
    }
  }
  getCodes(root)

  return text
    .split("")
    .map((char) => codes[char])
    .join("")
}

const TreeNode: React.FC<{ node: HuffmanNode; x: number; y: number; level: number }> = ({ node, x, y, level }) => {
  const radius = 20
  const verticalSpacing = 80
  const horizontalSpacing = 60 / (level + 1)

  if (!node) return null

  return (
    <g>
      <circle cx={x} cy={y} r={radius} fill="hsl(var(--primary))" />
      <text x={x} y={y + radius + 15} textAnchor="middle" fill="hsl(var(--primary))" fontSize="12">
        {node.char || "•"}
      </text>
      {node.left && (
        <>
          <line
            x1={x}
            y1={y + radius}
            x2={x - horizontalSpacing}
            y2={y + verticalSpacing - radius}
            stroke="hsl(var(--primary))"
          />
          <TreeNode node={node.left} x={x - horizontalSpacing} y={y + verticalSpacing} level={level + 1} />
        </>
      )}
      {node.right && (
        <>
          <line
            x1={x}
            y1={y + radius}
            x2={x + horizontalSpacing}
            y2={y + verticalSpacing - radius}
            stroke="hsl(var(--primary))"
          />
          <TreeNode node={node.right} x={x + horizontalSpacing} y={y + verticalSpacing} level={level + 1} />
        </>
      )}
    </g>
  )
}

export default function HuffmanCodingVisualizer() {
  const [inputText, setInputText] = useState("HELLO WORLD")
  const [step, setStep] = useState(0)
  const [frequencyData, setFrequencyData] = useState<{ char: string; count: number }[]>([])
  const [huffmanTree, setHuffmanTree] = useState<HuffmanNode | null>(null)
  const [encodedText, setEncodedText] = useState("")
  const [hoveredChar, setHoveredChar] = useState("")
  const [showExplanation, setShowExplanation] = useState(false)

  useEffect(() => {
    handleReset()
  }, [inputText])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputText(e.target.value.toUpperCase())
  }

  const handleNextStep = () => {
    if (step === 0) {
      setFrequencyData(getFrequencyData(inputText))
    } else if (step === 1) {
      setHuffmanTree(buildHuffmanTree(inputText))
    } else if (step === 2) {
      setEncodedText(encodeText(inputText, huffmanTree!))
    }
    setStep((prevStep) => Math.min(prevStep + 1, 3))
    setShowExplanation(false)
  }

  const handleReset = () => {
    setStep(0)
    setFrequencyData([])
    setHuffmanTree(null)
    setEncodedText("")
    setShowExplanation(false)
  }

  const toggleExplanation = () => {
    setShowExplanation(!showExplanation)
  }

  const renderExplanation = () => {
    switch (step) {
      case 1:
        return (
          <div className="mt-4 p-4 bg-muted rounded-lg">
            <h4 className="font-semibold mb-2">In-depth Explanation: Frequency Analysis</h4>
            <p>
              Frequency analysis is the first step in Huffman coding. Here's what's happening:
            </p>
            <ol className="list-decimal list-inside mt-2 space-y-2">
              <li>We iterate through each character in the input text.</li>
              <li>For each character, we count how many times it appears.</li>
              <li>We store these counts in a data structure (usually a hash table or dictionary).</li>
              <li>The resulting frequency data is used to build the Huffman tree in the next step.</li>
            </ol>
            <p className="mt-2">
              Characters that appear more frequently will be assigned shorter codes, which is the key to
              Huffman coding's compression efficiency. This step helps us identify which characters should
              get shorter codes.
            </p>
          </div>
        )
      case 2:
        return (
          <div className="mt-4 p-4 bg-muted rounded-lg">
            <h4 className="font-semibold mb-2">In-depth Explanation: Building the Huffman Tree</h4>
            <p>
              The Huffman tree is a binary tree that determines the codes for each character. Here's how it's built:
            </p>
            <ol className="list-decimal list-inside mt-2 space-y-2">
              <li>Start with a list of nodes, one for each character, weighted by their frequency.</li>
              <li>Repeatedly take the two nodes with the lowest frequencies and combine them into a new node.</li>
              <li>The new node's frequency is the sum of its two child nodes.</li>
              <li>Add this new node back to the list.</li>
              <li>Repeat steps 2-4 until only one node remains (the root of the Huffman tree).</li>
            </ol>
            <p className="mt-2">
              This process ensures that characters with higher frequencies are closer to the root of the tree,
              resulting in shorter codes for these characters.
            </p>
          </div>
        )
      case 3:
        return (
          <div className="mt-4 p-4 bg-muted rounded-lg">
            <h4 className="font-semibold mb-2">In-depth Explanation: Encoding</h4>
            <p>
              The encoding process uses the Huffman tree to assign unique binary codes to each character. Here's how it works:
            </p>
            <ol className="list-decimal list-inside mt-2 space-y-2">
              <li>Start at the root of the Huffman tree.</li>
              <li>For each character, trace the path from the root to the character's leaf node.</li>
              <li>Assign '0' for each left branch and '1' for each right branch along this path.</li>
              <li>The sequence of 0s and 1s forms the code for that character.</li>
              <li>Replace each character in the original text with its corresponding code.</li>
            </ol>
            <p className="mt-2">
              This encoding ensures that no code is a prefix of another, allowing for unambiguous decoding.
              The resulting encoded text is a compressed version of the original, often significantly shorter in bit length.
            </p>
          </div>
        )
      default:
        return null
    }
  }

  return (
    <div className="container mx-auto p-4 min-h-screen flex flex-col items-center justify-center">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle>Huffman Coding Visualizer</CardTitle>
          <CardDescription>Explore the process of Huffman Coding step by step</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center space-y-4">
            <Input
              placeholder="Enter text to encode"
              value={inputText}
              onChange={handleInputChange}
              className="w-full max-w-md"
            />
            <div className="flex space-x-2">
              <Button onClick={handleNextStep} disabled={step >= 3}>
                {step === 0 ? "Start Visualization" : "Next Step"}
              </Button>
              <Button onClick={handleReset} variant="outline">
                Reset
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {step > 0 && (
        <Card className="w-full max-w-4xl mt-8">
          <CardContent className="p-6">
            <Tabs defaultValue="visualization" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="visualization">Visualization</TabsTrigger>
                <TabsTrigger value="explanation">Explanation</TabsTrigger>
              </TabsList>
              <TabsContent value="visualization">
                <div className="space-y-8">
                  {step >= 1 && (
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <h3 className="text-lg font-semibold">Step 1: Frequency Analysis</h3>
                        <Button onClick={toggleExplanation} variant="outline" size="sm">
                          <Info className="w-4 h-4 mr-2" />
                          {showExplanation ? "Hide" : "Show"} Explanation
                        </Button>
                      </div>
                      <div className="h-[200px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={frequencyData}>
                            <XAxis dataKey="char" />
                            <YAxis />
                            <Tooltip
                              content={({ active, payload }) => {
                                if (active && payload && payload.length) {
                                  return (
                                    <div className="bg-background border border-border p-2 rounded shadow">
                                      <p className="text-foreground">
                                        {`${payload[0].payload.char}: ${payload[0].value}`}
                                      </p>
                                    </div>
                                  );
                                }
                                return null;
                              }}
                            />
                            <Bar dataKey="count" fill="hsl(var(--primary))" />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                      {showExplanation && renderExplanation()}
                      {step === 1 && (
                        <div className="mt-4 flex justify-center">
                          <Button onClick={handleNextStep}>Next Step</Button>
                        </div>
                      )}
                    </div>
                  )}

                  {step >= 2 && (
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <h3 className="text-lg font-semibold">Step 2: Huffman Tree</h3>
                        <Button onClick={toggleExplanation} variant="outline" size="sm">
                          <Info className="w-4 h-4 mr-2" />
                          {showExplanation ? "Hide" : "Show"} Explanation
                        </Button>
                      </div>
                      <div className="flex justify-center items-center h-[400px] overflow-auto">
                        <svg width="100%" height="100%" viewBox="0 0 800 400">
                          {huffmanTree && <TreeNode node={huffmanTree} x={400} y={40} level={0} />}
                        </svg>
                      </div>
                      {showExplanation && renderExplanation()}
                      {step === 2 && (
                        <div className="mt-4 flex justify-center">
                          <Button onClick={handleNextStep}>Next Step</Button>
                        </div>
                      )}
                    </div>
                  )}

                  {step >= 3 && (
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <h3 className="text-lg font-semibold">Step 3: Encoding</h3>
                        <Button onClick={toggleExplanation} variant="outline" size="sm">
                          <Info className="w-4 h-4 mr-2" />
                          {showExplanation ? "Hide" : "Show"} Explanation
                        </Button>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="flex-1">
                          <h4 className="text-md font-semibold  mb-2">Original Text:</h4>
                          <p className="text-xl font-mono">{inputText}</p>
                        </div>
                        <ArrowRight className="w-8 h-8" />
                        <div className="flex-1">
                          <h4 className="text-md font-semibold mb-2">Encoded Text:</h4>
                          <p className="text-xl font-mono break-all">
                            {encodedText.split("").map((bit, index) => (
                              <span
                                key={index}
                                className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
                                onMouseEnter={() => setHoveredChar(inputText[index])}
                                onMouseLeave={() => setHoveredChar("")}
                              >
                                {bit}
                              </span>
                            ))}
                          </p>
                          {hoveredChar && (
                            <p className="mt-2">
                              Hovered character: {hoveredChar} (Code:{" "}
                              {huffmanTree ? encodeText(hoveredChar, huffmanTree) : ""})
                            </p>
                          )}
                        </div>
                      </div>
                      {showExplanation && renderExplanation()}
                      <div className="mt-4">
                        <h4 className="text-md font-semibold mb-2">Compression Analysis:</h4>
                        <p>
                          Original size: {inputText.length * 8} bits
                          <br />
                          Compressed size: {encodedText.length} bits
                          <br />
                          Compression ratio:{" "}
                          {((1 - encodedText.length / (inputText.length * 8)) * 100).toFixed(2)}%
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </TabsContent>
              <TabsContent value="explanation">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold">Step 1: Frequency Analysis</h3>
                    <p>
                      In this step, we count how often each character appears in the input text. Characters
                      that appear more frequently will be assigned shorter codes, which is the key to
                      Huffman coding's compression efficiency.
                    </p>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">Step 2: Building the Huffman Tree</h3>
                    <p>
                      We create a binary tree based on the character frequencies. The process starts with
                      each character as a leaf node. We repeatedly combine the two nodes with the lowest
                      frequencies until we have a single root node. This tree structure determines the
                      binary codes for each character.
                    </p>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">Step 3: Encoding</h3>
                    <p>
                      We traverse the Huffman tree to assign binary codes to each character. Left branches
                      are labeled with '0' and right branches with '1'. The path from the root to a
                      character's leaf node becomes its code. We then replace each character in the
                      original text with its corresponding code.
                    </p>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">Compression Analysis</h3>
                    <p>
                      We compare the size of the original text (assuming 8 bits per character) with the
                      size of the encoded text. The difference shows how much space we've saved through
                      Huffman coding. This compression is lossless, meaning we can fully recover the
                      original text from the encoded version.
                    </p>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  )
}