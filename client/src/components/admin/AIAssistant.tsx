import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Bot, Send, Terminal, RefreshCw, Loader2, Sparkles, Power, PowerOff, Server } from 'lucide-react';
import { apiClient } from '../../api/client';
import toast from 'react-hot-toast';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export const AIAssistant = () => {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: "Hello! I'm your WaveWord Server Assistant. You can click on the quick actions below, or ask me to generate commands for you." }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [pendingCommand, setPendingCommand] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleCommand = async (command: string, password?: string) => {
    if (!password) {
      setMessages(prev => [...prev, { role: 'user', content: command }]);
    } else {
      setMessages(prev => [...prev, { role: 'user', content: '********' }]);
    }
    
    setLoading(true);
    try {
      const res = await apiClient.post('/admin/ai/command', { command, password });
      
      if (res.data.requirePassword) {
        setPendingCommand(command);
      } else {
        setPendingCommand(null);
      }
      
      setMessages(prev => [...prev, { role: 'assistant', content: res.data.output || res.data.error }]);
    } catch (err) {
      toast.error('Failed to execute command');
      setMessages(prev => [...prev, { role: 'assistant', content: 'An error occurred while executing the command.' }]);
      setPendingCommand(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    
    if (pendingCommand) {
      handleCommand(pendingCommand, input);
    } else {
      handleCommand(input);
    }
    setInput('');
  };

  const quickActions = [
    { label: 'Restart server', icon: <RefreshCw size={16} /> },
    { label: 'Restart nginx', icon: <Server size={16} /> },
    { label: 'Reboot', icon: <Power size={16} /> },
    { label: 'Shutdown', icon: <PowerOff size={16} /> },
  ];

  return (
    <Card className="w-full h-full max-h-[80vh] flex flex-col bg-surface border-border">
      <CardHeader className="border-b border-border pb-4">
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="text-primary" /> AI Server Assistant
        </CardTitle>
      </CardHeader>
      
      <CardContent className="flex-1 overflow-hidden flex flex-col p-0">
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`flex gap-3 max-w-[80%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'user' ? 'bg-primary/20 text-primary' : 'bg-secondary/20 text-secondary-foreground'}`}>
                  {msg.role === 'user' ? <Terminal size={16} /> : <Bot size={16} />}
                </div>
                <div className={`p-3 rounded-lg ${msg.role === 'user' ? 'bg-primary text-white rounded-tr-none' : 'bg-background border border-border rounded-tl-none'}`}>
                  {msg.role === 'assistant' && msg.content.includes('\n') ? (
                    <pre className="text-xs font-mono whitespace-pre-wrap">{msg.content}</pre>
                  ) : (
                    <p className="text-sm">{msg.content}</p>
                  )}
                </div>
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="flex gap-3 max-w-[80%] flex-row">
                <div className="w-8 h-8 rounded-full bg-secondary/20 flex items-center justify-center shrink-0 text-secondary-foreground">
                  <Bot size={16} />
                </div>
                <div className="p-3 rounded-lg bg-background border border-border rounded-tl-none flex items-center gap-2">
                  <Loader2 className="animate-spin size-4" /> <span className="text-sm text-muted">Thinking...</span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
        
        <div className="p-4 border-t border-border bg-background/50">
          <div className="flex flex-wrap gap-2 mb-4">
            {quickActions.map(action => (
              <button
                key={action.label}
                onClick={() => handleCommand(action.label)}
                disabled={loading}
                className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium bg-surface hover:bg-surface/80 border border-border rounded-full transition-colors disabled:opacity-50"
              >
                {action.icon} {action.label}
              </button>
            ))}
          </div>
          
          <form onSubmit={handleSend} className="flex gap-2">
            <input
              type={pendingCommand ? "password" : "text"}
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder={pendingCommand ? "Enter sudo password to confirm..." : "Ask for commands or type a quick action..."}
              className="flex-1 bg-surface border border-border rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-primary"
              disabled={loading}
            />
            <Button type="submit" disabled={!input.trim() || loading} className="gap-2">
              <Send size={16} />
            </Button>
          </form>
        </div>
      </CardContent>
    </Card>
  );
};
