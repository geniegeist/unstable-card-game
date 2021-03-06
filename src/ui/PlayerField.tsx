import styled from 'styled-components';
import type { Player, PlayerID } from "../game/player";
import ImageLoader from '../assets/card/imageLoader';
import { _typeToColor } from './util';
import type { Card, CardID } from '../game/card';
import useDynamicRefs from 'use-dynamic-refs';
import React, { RefObject, useContext, useImperativeHandle, useState } from 'react';
import CardHover from './CardHover';
import { motion } from 'framer-motion';
import useSound from 'use-sound';
import { cardDescription } from '../BoardUtil';
import { LanguageContext } from '../LanguageContextProvider';
const HubMouseOverSound = require('../assets/sound/Hub_Mouseover.ogg').default;

type Props = {
    players: Player[];
    stable: { [key: string]: Card[] };
    highlightMode?: CardID[];
    upgradeDowngradeStable: { [key: string]: Card[] };
    currentPlayer: PlayerID;
    handCount: number[];
    onStableCardClick: (cardID: CardID) => void;
    onStableCardMouseEnter: (cardID: CardID) => void;
    onStableCardMouseLeave: (cardID: CardID) => void;
    onPlayerClick: (playerID: PlayerID) => void;
    onHandClick: (playerID: PlayerID) => void;
}

export type PlayerFieldHandle = {
    getStableItemRef: (cardID: CardID) => RefObject<HTMLDivElement>; 
}

const PlayerField = React.forwardRef<PlayerFieldHandle, Props>((props, ref) => {
    const [getItemRefs, setItemRefs] = useDynamicRefs();
    const [showHover, setShowHover] = useState<undefined | CardID>(undefined);
    const [playHubMouseOverSound] = useSound(HubMouseOverSound, {
        volume: 0.2,
    });
    const context = useContext(LanguageContext)

    useImperativeHandle(ref, () => ({
        getStableItemRef: (cardID: CardID) => {
            return getItemRefs(`${cardID}`) as any;
        }
    }));

    return (
        <Wrapper>
            {props.players.map((pl, idx) => {
                return (
                    <PlayerBox key={pl.id} current={pl.id === props.currentPlayer}>
                        <InnerBox onClick={() => props.onPlayerClick(pl.id)}>
                            <Title>
                                <div>
                                    {pl.name}
                                </div>
                                <div style={{ position: "absolute", right: "0.6em", backgroundColor: "rgba(255,255,255,0.2)", width: "23px", height: "30px", borderRadius: "4px", transform: "rotate(14deg) translate(3px,0)" }}>

                                </div>
                                <div style={{ position: "absolute", right: "0.6em", backgroundColor: "rgba(255,255,255,0.1)", width: "23px", height: "30px", borderRadius: "4px", transform: "rotate(23deg) translate(6px,0)" }}>

                                </div>
                                <CardCounter onClick={() => props.onHandClick(pl.id)}>
                                    {props.handCount[parseInt(pl.id)]}
                                </CardCounter>
                            </Title>
                            <UpgradeDowngradeStable>
                                {props.upgradeDowngradeStable[pl.id].map(c => {
                                    return (
                                        <div 
                                            key={c.id}
                                            ref={setItemRefs(`${c.id}`) as any} 
                                            style={{ position: "relative" }} onMouseEnter={() => {
                                                playHubMouseOverSound();
                                                setShowHover(c.id);
                                            }}
                                            onMouseLeave={() => {
                                                setShowHover(undefined);
                                            }}>
                                            <UpgradeDowngradeImage key={c.id} isTranslucent={props.highlightMode ? !props.highlightMode.includes(c.id) : false} image={ImageLoader.load(c.image)} onClick={() => props.onStableCardClick(c.id)} />
                                            {showHover === c.id &&
                                                <CardHover title={c.title} position={"top"} offset={{ x: 40, y: 0 }} color={_typeToColor(c.type)} text={cardDescription(c, context!.language)} />
                                            }
                                        </div>
                                    );
                                })}
                            </UpgradeDowngradeStable>
                            <Stable>
                                {props.stable[pl.id].map(c => {
                                    return (
                                        <div 
                                            key={c.id} 
                                            ref={setItemRefs(`${c.id}`) as any} 
                                            style={{ position: "relative" }} 
                                            onMouseEnter={() => {
                                                playHubMouseOverSound();
                                                setShowHover(c.id);
                                            }}
                                            onMouseLeave={() => {
                                                setShowHover(undefined);
                                            }}>
                                            <UnicornImage layoutId={`${c.id}`}isTranslucent={props.highlightMode ? !props.highlightMode.includes(c.id) : false} image={ImageLoader.load(c.image)} onClick={() => props.onStableCardClick(c.id)} 
                                                onMouseEnter={() => props.onStableCardMouseEnter(c.id)}
                                                onMouseLeave={() => props.onStableCardMouseLeave(c.id)}
                                            />
                                            {showHover === c.id &&
                                                <CardHover title={c.title} position={"top"} offset={{ x: 64, y: 0 }} color={_typeToColor(c.type)} text={cardDescription(c, context!.language)} />
                                            }
                                        </div>
                                    );
                                })}
                                {props.stable[pl.id].length === 0 &&
                                    <p style={{ opacity: 0.7 }}>Stable is empty</p>
                                }
                            </Stable>
                        </InnerBox>
                    </PlayerBox>
                );
            })}
        </Wrapper>
    );
});

const Wrapper = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
`;

const PlayerBox = styled.div<{ current: boolean }>`
    width: 180px;
    height: 220px;
    background-color: ${props => props.current ? "rgba(0,0,0,0.5)" : "rgba(0,0,0,0)"};
    border-radius: 16px;
    margin: 0.6em;
    padding: 0.5em;
`;

const InnerBox = styled.div`
    height: 100%;
    width: 100%;
    border-radius: 12px;
    background-color: #BC4747;
    box-shadow: 0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24);
    cursor: pointer;
    transition: all 0.3s cubic-bezier(.25,.8,.25,1);
    :hover {
        box-shadow: 0 14px 28px rgba(0,0,0,0.25), 0 10px 10px rgba(0,0,0,0.22);
    }
`;

const Title = styled.div`
    color: white;
    font-family: Open Sans;
    padding: 0.5em 0.5em 0 0.5em;
    font-size: 1.2em;
    display: flex;
    position: relative;
`;

const UpgradeDowngradeStable = styled.div`
    width: 100%;
    display: flex;
    flex-wrap: no-wrap;
    align-items: center;
    margin: 0.5em 0.5em;
`;

const UpgradeDowngradeImage = styled.img<{ image: string, isTranslucent: boolean }>`
    background-image: url(${props => props.image});
    background-size: cover;
    width: 30px;
    height: 30px;
    border-radius: 8px;
    margin: 0 0.1em;
    opacity: ${props => !props.isTranslucent ? 1 : 0.5};
    transition: all 0.3s cubic-bezier(.25,.8,.25,1);
`;

const Stable = styled.div`
    width: 100%;
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: center;
    position: relative;
`;

const UnicornImage = styled(motion.div)<{ image: string, isTranslucent: boolean }>`
    background-image: url(${props => props.image});
    background-size: cover;
    min-width: 50px;
    height: 60px;
    border-radius: 8px;
    margin: 0.2em;
    opacity: ${props => !props.isTranslucent ? 1 : 0.5};
    transition: all 0.3s cubic-bezier(.25,.8,.25,1);
    cursor: pointer;
`;

const CardCounter = styled.div`
    position: absolute;
    right: 0.6em;
    background-color: rgba(255,255,255,0.5);
    padding: 0.1em 0.3em;
    border-radius: 4px;
    transition: all 0.3s cubic-bezier(.25,.8,.25,1);
    :hover {
        box-shadow: 0 7px 14px rgba(0,0,0,0.125), 0 5px 5px rgba(0,0,0,0.11);
      }
`;

export default PlayerField;